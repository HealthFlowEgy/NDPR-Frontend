/**
 * HealthFlow Mobile App - Authentication Service
 * 
 * Handles OAuth 2.0 + PKCE authentication with Keycloak.
 * Validated against RegistryAdmin realm.
 */

import { authorize, refresh, revoke, AuthConfiguration } from 'react-native-app-auth';
import { config } from '../config/environment';
import StorageService from './storage.service';
import { AuthTokens, UserProfile } from '../types';

// Keycloak OAuth configuration
const authConfig: AuthConfiguration = {
  issuer: config.keycloak.issuer,
  clientId: config.keycloak.clientId,
  redirectUrl: config.oauth.redirectUri,
  scopes: config.oauth.scopes,
  usePKCE: config.oauth.usePKCE,
  serviceConfiguration: {
    authorizationEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/auth`,
    tokenEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/token`,
    revocationEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/revoke`,
    endSessionEndpoint: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/logout`,
  },
};

class AuthService {
  /**
   * Initiate OAuth login flow
   * Opens browser for Keycloak login
   */
  async login(): Promise<AuthTokens> {
    try {
      const result = await authorize(authConfig);
      
      const tokens: AuthTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        idToken: result.idToken,
        expiresAt: result.accessTokenExpirationDate,
      };

      // Store tokens securely
      await StorageService.storeTokens(tokens);
      await StorageService.updateLastActivity();

      // Fetch and store user profile
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

      const result = await refresh(authConfig, {
        refreshToken: currentTokens.refreshToken,
      });

      const tokens: AuthTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || currentTokens.refreshToken,
        idToken: result.idToken || currentTokens.idToken,
        expiresAt: result.accessTokenExpirationDate,
      };

      await StorageService.storeTokens(tokens);
      await StorageService.updateLastActivity();

      return tokens;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
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
      
      if (tokens?.accessToken) {
        await revoke(authConfig, {
          tokenToRevoke: tokens.accessToken,
          includeBasicAuth: false,
        });
      }
    } catch (error) {
      // Continue with logout even if revocation fails
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
    const tokens = await StorageService.getTokens();
    
    if (!tokens) {
      return false;
    }

    // Check if token is expired
    if (new Date(tokens.expiresAt) <= new Date()) {
      // Try to refresh
      try {
        await this.refreshTokens();
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Get valid access token (refreshes if needed)
   */
  async getValidAccessToken(): Promise<string> {
    const tokens = await StorageService.getTokens();
    
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    // Check if token needs refresh (refresh 1 minute before expiry)
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
    const isExpired = await StorageService.isSessionExpired(config.security.sessionTimeoutMinutes);
    
    if (isExpired) {
      await this.logout();
      return false;
    }

    await StorageService.updateLastActivity();
    return true;
  }

  /**
   * Decode JWT token to get payload
   */
  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

export default new AuthService();
