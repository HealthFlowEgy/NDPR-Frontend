/**
 * HealthFlow Mobile App - Authentication Service
 * 
 * Handles OAuth 2.0 + PKCE authentication with Keycloak.
 * Uses expo-auth-session for Expo SDK 52 compatibility.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { config } from '../config/environment';
import StorageService from './storage.service';
import { AuthTokens, UserProfile } from '../types';

// Enable web browser redirect - wrapped in try-catch for safety
try {
  WebBrowser.maybeCompleteAuthSession();
} catch (e) {
  console.warn('WebBrowser.maybeCompleteAuthSession failed:', e);
}

// Discovery document for Keycloak
const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/auth`,
  tokenEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/token`,
  revocationEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/revoke`,
  endSessionEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/logout`,
  userInfoEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/userinfo`,
};

// Get redirect URI for the app - with fallback
const getRedirectUri = () => {
  try {
    return AuthSession.makeRedirectUri({
      scheme: 'healthflow',
      path: 'auth/callback',
    });
  } catch (e) {
    console.warn('Failed to create redirect URI:', e);
    return 'healthflow://auth/callback';
  }
};

class AuthService {
  private codeVerifier: string | null = null;
  private redirectUri: string;

  constructor() {
    this.redirectUri = getRedirectUri();
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private async generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const codeVerifier = this.base64URLEncode(randomBytes);
      
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      
      const codeChallenge = digest
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      return { codeVerifier, codeChallenge };
    } catch (error) {
      console.error('PKCE generation failed:', error);
      throw new Error('Failed to generate PKCE challenge');
    }
  }

  private base64URLEncode(bytes: Uint8Array): string {
    // Use a safer encoding method
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Use global btoa if available, otherwise use Buffer
    let base64: string;
    if (typeof btoa !== 'undefined') {
      base64 = btoa(binary);
    } else if (typeof Buffer !== 'undefined') {
      base64 = Buffer.from(binary, 'binary').toString('base64');
    } else {
      // Fallback - shouldn't happen in React Native
      throw new Error('No base64 encoding available');
    }
    
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Initiate OAuth login flow
   */
  async login(): Promise<AuthTokens> {
    try {
      const { codeVerifier, codeChallenge } = await this.generatePKCE();
      this.codeVerifier = codeVerifier;

      const authRequest = new AuthSession.AuthRequest({
        clientId: config.keycloak.clientId,
        redirectUri: this.redirectUri,
        scopes: config.oauth.scopes,
        responseType: AuthSession.ResponseType.Code,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        codeChallenge,
      });

      const result = await authRequest.promptAsync(discovery);

      if (result.type !== 'success' || !result.params.code) {
        throw new Error('Authentication cancelled or failed');
      }

      // Exchange code for tokens
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: config.keycloak.clientId,
          code: result.params.code,
          redirectUri: this.redirectUri,
          extraParams: {
            code_verifier: codeVerifier,
          },
        },
        discovery
      );

      const tokens: AuthTokens = {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || '',
        idToken: tokenResponse.idToken || '',
        expiresAt: tokenResponse.expiresIn
          ? new Date(Date.now() + tokenResponse.expiresIn * 1000).toISOString()
          : new Date(Date.now() + 3600000).toISOString(),
      };

      await StorageService.storeTokens(tokens);
      await StorageService.updateLastActivity();

      const profile = await this.getUserInfo(tokens.accessToken);
      await StorageService.storeUserProfile(profile);

      return tokens;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(): Promise<AuthTokens> {
    try {
      const currentTokens = await StorageService.getTokens();
      
      if (!currentTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokenResponse = await AuthSession.refreshAsync(
        {
          clientId: config.keycloak.clientId,
          refreshToken: currentTokens.refreshToken,
        },
        discovery
      );

      const tokens: AuthTokens = {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || currentTokens.refreshToken,
        idToken: tokenResponse.idToken || currentTokens.idToken,
        expiresAt: tokenResponse.expiresIn
          ? new Date(Date.now() + tokenResponse.expiresIn * 1000).toISOString()
          : new Date(Date.now() + 3600000).toISOString(),
      };

      await StorageService.storeTokens(tokens);
      await StorageService.updateLastActivity();

      return tokens;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      await this.logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  /**
   * Logout user and revoke tokens
   */
  async logout(): Promise<void> {
    try {
      const tokens = await StorageService.getTokens();
      
      if (tokens?.accessToken && discovery.revocationEndpoint) {
        await AuthSession.revokeAsync(
          {
            clientId: config.keycloak.clientId,
            token: tokens.accessToken,
          },
          discovery
        );
      }
    } catch (error) {
      console.warn('Token revocation failed:', error);
    } finally {
      await StorageService.clearAll();
    }
  }

  /**
   * Get user info from Keycloak
   */
  async getUserInfo(accessToken?: string): Promise<UserProfile> {
    const token = accessToken || await StorageService.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(
      `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await StorageService.getTokens();
      
      if (!tokens) {
        return false;
      }

      if (new Date(tokens.expiresAt) <= new Date()) {
        try {
          await this.refreshTokens();
          return true;
        } catch {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn('isAuthenticated check failed:', error);
      return false;
    }
  }

  /**
   * Get valid access token (refreshes if needed)
   */
  async getValidAccessToken(): Promise<string> {
    const tokens = await StorageService.getTokens();
    
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const expiryTime = new Date(tokens.expiresAt).getTime();
    const now = Date.now();
    const oneMinute = 60 * 1000;

    if (expiryTime - now < oneMinute) {
      const newTokens = await this.refreshTokens();
      return newTokens.accessToken;
    }

    return tokens.accessToken;
  }

  /**
   * Check and refresh session activity
   */
  async checkSession(): Promise<boolean> {
    try {
      const isExpired = await StorageService.isSessionExpired(config.security.sessionTimeoutMinutes);
      
      if (isExpired) {
        await this.logout();
        return false;
      }

      await StorageService.updateLastActivity();
      return true;
    } catch (error) {
      console.warn('checkSession failed:', error);
      return false;
    }
  }

  /**
   * Decode JWT token to get payload
   */
  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      // Handle base64url decoding
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      let decoded: string;
      if (typeof atob !== 'undefined') {
        decoded = atob(base64);
      } else if (typeof Buffer !== 'undefined') {
        decoded = Buffer.from(base64, 'base64').toString('utf-8');
      } else {
        return null;
      }
      
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Get the redirect URI for configuration
   */
  getRedirectUri(): string {
    return this.redirectUri;
  }
}

export default new AuthService();
