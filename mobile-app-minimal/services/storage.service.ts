/**
 * HealthFlow Mobile App - Secure Storage Service
 * 
 * Handles encrypted storage of sensitive data using expo-secure-store.
 * All tokens and credentials are stored in the device's native keychain.
 */

import * as SecureStore from 'expo-secure-store';

// Storage keys
const KEYS = {
  ACCESS_TOKEN: 'healthflow_access_token',
  REFRESH_TOKEN: 'healthflow_refresh_token',
  ID_TOKEN: 'healthflow_id_token',
  TOKEN_EXPIRY: 'healthflow_token_expiry',
  USER_DID: 'healthflow_user_did',
  USER_PROFILE: 'healthflow_user_profile',
  DEVICE_ID: 'healthflow_device_id',
  BIOMETRIC_ENABLED: 'healthflow_biometric_enabled',
  LAST_ACTIVITY: 'healthflow_last_activity',
} as const;

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: string;
}

class StorageService {
  // ============================================
  // Token Management
  // ============================================

  /**
   * Store authentication tokens securely
   */
  async storeTokens(tokens: StoredTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
      SecureStore.setItemAsync(KEYS.ID_TOKEN, tokens.idToken),
      SecureStore.setItemAsync(KEYS.TOKEN_EXPIRY, tokens.expiresAt),
    ]);
  }

  /**
   * Retrieve stored tokens
   */
  async getTokens(): Promise<StoredTokens | null> {
    const [accessToken, refreshToken, idToken, expiresAt] = await Promise.all([
      SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(KEYS.ID_TOKEN),
      SecureStore.getItemAsync(KEYS.TOKEN_EXPIRY),
    ]);

    if (!accessToken || !refreshToken || !idToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      idToken,
      expiresAt: expiresAt || '',
    };
  }

  /**
   * Get access token only
   */
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token only
   */
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear all tokens (logout)
   */
  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.ID_TOKEN),
      SecureStore.deleteItemAsync(KEYS.TOKEN_EXPIRY),
    ]);
  }

  /**
   * Check if token is expired
   */
  async isTokenExpired(): Promise<boolean> {
    const expiresAt = await SecureStore.getItemAsync(KEYS.TOKEN_EXPIRY);
    if (!expiresAt) return true;
    
    return new Date(expiresAt) <= new Date();
  }

  // ============================================
  // DID Management
  // ============================================

  /**
   * Store user's DID document
   */
  async storeDID(didDocument: object): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_DID, JSON.stringify(didDocument));
  }

  /**
   * Retrieve user's DID document
   */
  async getDID(): Promise<object | null> {
    const did = await SecureStore.getItemAsync(KEYS.USER_DID);
    return did ? JSON.parse(did) : null;
  }

  /**
   * Clear DID
   */
  async clearDID(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.USER_DID);
  }

  // ============================================
  // User Profile
  // ============================================

  /**
   * Store user profile
   */
  async storeUserProfile(profile: object): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  /**
   * Retrieve user profile
   */
  async getUserProfile(): Promise<object | null> {
    const profile = await SecureStore.getItemAsync(KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  }

  // ============================================
  // Device Management
  // ============================================

  /**
   * Get or create device ID
   */
  async getDeviceId(): Promise<string> {
    let deviceId = await SecureStore.getItemAsync(KEYS.DEVICE_ID);
    
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await SecureStore.setItemAsync(KEYS.DEVICE_ID, deviceId);
    }
    
    return deviceId;
  }

  // ============================================
  // Biometric Settings
  // ============================================

  /**
   * Store biometric preference
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, String(enabled));
  }

  /**
   * Check if biometric is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    const enabled = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Update last activity timestamp
   */
  async updateLastActivity(): Promise<void> {
    await SecureStore.setItemAsync(KEYS.LAST_ACTIVITY, new Date().toISOString());
  }

  /**
   * Get last activity timestamp
   */
  async getLastActivity(): Promise<Date | null> {
    const timestamp = await SecureStore.getItemAsync(KEYS.LAST_ACTIVITY);
    return timestamp ? new Date(timestamp) : null;
  }

  /**
   * Check if session is expired (15 min inactivity)
   */
  async isSessionExpired(timeoutMinutes: number = 15): Promise<boolean> {
    const lastActivity = await this.getLastActivity();
    if (!lastActivity) return true;

    const now = new Date();
    const diff = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    return diff > timeoutMinutes;
  }

  // ============================================
  // Clear All Data
  // ============================================

  /**
   * Clear all stored data (full logout)
   */
  async clearAll(): Promise<void> {
    await Promise.all(
      Object.values(KEYS).map(key => SecureStore.deleteItemAsync(key))
    );
  }
}

export default new StorageService();
