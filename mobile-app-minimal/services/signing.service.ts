/**
 * HealthFlow Mobile App - Signing Service
 * 
 * Handles remote document signing operations.
 * Validated against https://signing.healthflow.tech API.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as Device from 'expo-device';
import ApiService from './api.service';
import StorageService from './storage.service';
import { apiRoutes, config } from '../config/environment';
import {
  SigningRequest,
  SigningRequestsResponse,
  SigningResponse,
  SigningStats,
  SigningHistoryItem,
  ApproveSigningRequest,
  RejectSigningRequest,
  BiometricCapabilities,
} from '../types';

class SigningService {
  /**
   * Get pending signing requests
   */
  async getPendingRequests(): Promise<SigningRequest[]> {
    const url = `${apiRoutes.signing.requests}?status=pending`;
    const response = await ApiService.get<SigningRequestsResponse>(url);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch signing requests');
    }
    
    return response.data.requests;
  }

  /**
   * Get all signing requests with optional status filter
   */
  async getRequests(status?: string): Promise<SigningRequest[]> {
    const url = status 
      ? `${apiRoutes.signing.requests}?status=${status}`
      : apiRoutes.signing.requests;
    
    const response = await ApiService.get<SigningRequestsResponse>(url);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch signing requests');
    }
    
    return response.data.requests;
  }

  /**
   * Get signing request by ID
   */
  async getRequestById(requestId: string): Promise<SigningRequest> {
    const url = apiRoutes.signing.requestById(requestId);
    const response = await ApiService.get<SigningRequest>(url);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch signing request');
    }
    
    return response.data;
  }

  /**
   * Approve and sign a request
   * Requires biometric authentication
   */
  async approveRequest(requestId: string): Promise<SigningResponse> {
    // Step 1: Verify biometric authentication
    const biometricResult = await this.authenticateBiometric();
    
    if (!biometricResult.success) {
      throw new Error('Biometric authentication required to sign documents');
    }

    // Step 2: Get device info
    const deviceInfo = await this.getDeviceInfo();

    // Step 3: Send approval request
    const url = apiRoutes.signing.approve(requestId);
    const body: ApproveSigningRequest = {
      biometric_verified: true,
      device_info: deviceInfo,
    };

    const response = await ApiService.post<SigningResponse>(url, body);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to approve signing request');
    }
    
    return response.data;
  }

  /**
   * Reject a signing request
   */
  async rejectRequest(requestId: string, reason: string): Promise<SigningResponse> {
    const deviceInfo = await this.getDeviceInfo();
    
    const url = apiRoutes.signing.reject(requestId);
    const body: RejectSigningRequest = {
      reason,
      device_info: deviceInfo,
    };

    const response = await ApiService.post<SigningResponse>(url, body);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to reject signing request');
    }
    
    return response.data;
  }

  /**
   * Get signing history
   */
  async getHistory(limit = 50, offset = 0): Promise<SigningHistoryItem[]> {
    const url = `${apiRoutes.signing.history}?limit=${limit}&offset=${offset}`;
    const response = await ApiService.get<{ history: SigningHistoryItem[] }>(url);
    
    if (!response.success || !response.data) {
      return [];
    }
    
    return response.data.history;
  }

  /**
   * Get signing statistics
   */
  async getStats(): Promise<SigningStats> {
    const url = apiRoutes.signing.stats;
    const response = await ApiService.get<SigningStats>(url);
    
    if (!response.success || !response.data) {
      return {
        total_signed: 0,
        total_rejected: 0,
        total_pending: 0,
        total_expired: 0,
        total_requests: 0,
      };
    }
    
    return response.data;
  }

  /**
   * Perform biometric authentication
   */
  async authenticateBiometric(): Promise<LocalAuthentication.LocalAuthenticationResult> {
    // Check if biometric is available
    const capabilities = await this.getBiometricCapabilities();
    
    if (!capabilities.isAvailable || !capabilities.isEnrolled) {
      throw new Error('Biometric authentication is not available on this device');
    }

    // Authenticate
    return LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign document',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use passcode',
    });
  }

  /**
   * Get biometric capabilities
   */
  async getBiometricCapabilities(): Promise<BiometricCapabilities> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType: 'face' | 'fingerprint' | 'iris' | 'none' = 'none';
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'face';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }

    return {
      isAvailable: hasHardware,
      biometricType,
      isEnrolled,
    };
  }

  /**
   * Get device information string
   */
  private async getDeviceInfo(): Promise<string> {
    const deviceId = await StorageService.getDeviceId();
    const brand = Device.brand || 'Unknown';
    const modelName = Device.modelName || 'Unknown';
    const osName = Device.osName || 'Unknown';
    const osVersion = Device.osVersion || 'Unknown';

    return `${brand} ${modelName} (${osName} ${osVersion}) - ${deviceId}`;
  }

  /**
   * Check if a request is expired
   */
  isRequestExpired(request: SigningRequest): boolean {
    return new Date(request.expires_at) <= new Date();
  }

  /**
   * Get time remaining until expiry
   */
  getTimeRemaining(request: SigningRequest): string {
    const now = new Date();
    const expiry = new Date(request.expires_at);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m remaining`;

    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `${diffHours}h ${remainingMins}m remaining`;
  }
}

export default new SigningService();
