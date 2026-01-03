/**
 * HealthFlow Mobile App - Signing Hooks
 * 
 * Custom React hooks for signing functionality.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPendingRequests,
  approveRequest,
  rejectRequest,
  selectPendingRequests,
  selectIsProcessing,
  selectSigningError,
  selectPendingCount,
  selectUrgentCount,
} from '../store/slices/signingSlice';
import SigningService from '../services/signing.service';
import { SigningRequest, SignedDocument, BiometricCapabilities } from '../types';

/**
 * Hook for managing signing requests
 */
export function useSigningRequests(autoRefresh = false, refreshInterval = 30000) {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(selectPendingRequests);
  const isProcessing = useAppSelector(selectIsProcessing);
  const error = useAppSelector(selectSigningError);
  const pendingCount = useAppSelector(selectPendingCount);
  const urgentCount = useAppSelector(selectUrgentCount);
  const [isLoading, setIsLoading] = useState(false);

  // Initial load
  useEffect(() => {
    loadRequests();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(fetchPendingRequests());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dispatch]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    await dispatch(fetchPendingRequests());
    setIsLoading(false);
  }, [dispatch]);

  const approve = useCallback(async (requestId: string): Promise<boolean> => {
    const result = await dispatch(approveRequest(requestId));
    return approveRequest.fulfilled.match(result);
  }, [dispatch]);

  const reject = useCallback(async (requestId: string, reason: string): Promise<boolean> => {
    const result = await dispatch(rejectRequest({ requestId, reason }));
    return rejectRequest.fulfilled.match(result);
  }, [dispatch]);

  return {
    requests,
    isLoading,
    isProcessing,
    error,
    pendingCount,
    urgentCount,
    refresh: loadRequests,
    approve,
    reject,
  };
}

/**
 * Hook for biometric authentication
 */
export function useBiometricAuth() {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    biometricType: 'none',
    isEnrolled: false,
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    const caps = await SigningService.getBiometricCapabilities();
    setCapabilities(caps);
  };

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!capabilities.isAvailable || !capabilities.isEnrolled) {
      return false;
    }

    setIsAuthenticating(true);
    try {
      const result = await SigningService.authenticateBiometric();
      return result.success;
    } catch {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [capabilities]);

  return {
    ...capabilities,
    isAuthenticating,
    authenticate,
    refresh: checkCapabilities,
  };
}

/**
 * Hook for session management
 */
export function useSession(timeoutMinutes = 15) {
  const [isActive, setIsActive] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkSession = async () => {
      const { default: StorageService } = await import('../services/storage.service');
      const expired = await StorageService.isSessionExpired(timeoutMinutes);
      
      if (expired) {
        setIsActive(false);
        // Trigger logout
        const { logout } = await import('../store/slices/authSlice');
        dispatch(logout());
      }
    };

    // Check every minute
    const interval = setInterval(checkSession, 60000);
    
    return () => clearInterval(interval);
  }, [timeoutMinutes, dispatch]);

  const updateActivity = useCallback(async () => {
    const { default: StorageService } = await import('../services/storage.service');
    await StorageService.updateLastActivity();
    setIsActive(true);
  }, []);

  return {
    isActive,
    updateActivity,
  };
}
