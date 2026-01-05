/**
 * HealthFlow Mobile App - Secure Storage Service
 * 
 * Handles encrypted storage of sensitive data using expo-secure-store.
 * All tokens and credentials are stored in the device's native keychain.
 * 
 * Updated: January 5, 2026 - Added credentials storage for offline access
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for SecureStore (sensitive data)
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

// Storage keys for AsyncStorage (larger data like credentials)
const ASYNC_KEYS = {
  CREDENTIALS: 'healthflow_credentials',
  CREDENTIALS_SYNC_TIME: 'healthflow_credentials_sync_time',
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
  // Credentials Management (NEW)
  // ============================================

  /**
   * Store credentials for offline access
   * Uses AsyncStorage for larger data
   */
  async storeCredentials(credentials: object[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ASYNC_KEYS.CREDENTIALS, JSON.stringify(credentials));
      await AsyncStorage.setItem(ASYNC_KEYS.CREDENTIALS_SYNC_TIME, new Date().toISOString());
    } catch (error) {
      console.warn('Failed to store credentials:', error);
    }
  }

  /**
   * Retrieve cached credentials
   */
  async getCredentials(): Promise<object[] | null> {
    try {
      const credentials = await AsyncStorage.getItem(ASYNC_KEYS.CREDENTIALS);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.warn('Failed to get credentials:', error);
      return null;
    }
  }

  /**
   * Get last credentials sync time
   */
  async getCredentialsSyncTime(): Promise<Date | null> {
    try {
      const syncTime = await AsyncStorage.getItem(ASYNC_KEYS.CREDENTIALS_SYNC_TIME);
      return syncTime ? new Date(syncTime) : null;
    } catch (error) {
      console.warn('Failed to get credentials sync time:', error);
      return null;
    }
  }

  /**
   * Check if credentials need sync (older than 1 hour)
   */
  async credentialsNeedSync(maxAgeMinutes: number = 60): Promise<boolean> {
    const syncTime = await this.getCredentialsSyncTime();
    if (!syncTime) return true;

    const now = new Date();
    const diff = (now.getTime() - syncTime.getTime()) / (1000 * 60);
    return diff > maxAgeMinutes;
  }

  /**
   * Clear cached credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ASYNC_KEYS.CREDENTIALS);
      await AsyncStorage.removeItem(ASYNC_KEYS.CREDENTIALS_SYNC_TIME);
    } catch (error) {
      console.warn('Failed to clear credentials:', error);
    }
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
    // Clear SecureStore
    await Promise.all(
      Object.values(KEYS).map(key => SecureStore.deleteItemAsync(key))
    );
    
    // Clear AsyncStorage
    await Promise.all(
      Object.values(ASYNC_KEYS).map(key => AsyncStorage.removeItem(key))
    );
  }
}

export default new StorageService();
