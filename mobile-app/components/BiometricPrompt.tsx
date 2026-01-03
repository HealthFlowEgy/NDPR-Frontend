/**
 * HealthFlow Mobile App - BiometricPrompt Component
 * 
 * Modal for biometric authentication before signing.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Modal, Portal, Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricPromptProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (error: string) => void;
  title?: string;
  subtitle?: string;
}

type BiometricType = 'face' | 'fingerprint' | 'none';

const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  onSuccess,
  onCancel,
  onError,
  title = 'Authentication Required',
  subtitle = 'Verify your identity to sign this document',
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    if (visible) {
      checkBiometricType();
      setErrorMessage(null);
      setAttempts(0);
    }
  }, [visible]);

  const checkBiometricType = async () => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else {
        setBiometricType('none');
      }
    } catch {
      setBiometricType('none');
    }
  };

  const getBiometricIcon = (): string => {
    switch (biometricType) {
      case 'face':
        return Platform.OS === 'ios' ? 'face-recognition' : 'face-recognition';
      case 'fingerprint':
        return 'fingerprint';
      default:
        return 'lock';
    }
  };

  const getBiometricLabel = (): string => {
    switch (biometricType) {
      case 'face':
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
      case 'fingerprint':
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      default:
        return 'Device PIN';
    }
  };

  const authenticate = async () => {
    if (attempts >= MAX_ATTEMPTS) {
      onError('Maximum authentication attempts exceeded');
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage(null);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign Document',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        onSuccess();
      } else {
        setAttempts(prev => prev + 1);
        
        if (result.error === 'user_cancel') {
          return;
        }
        
        setErrorMessage(getErrorMessage(result.error));
        
        if (attempts + 1 >= MAX_ATTEMPTS) {
          onError('Maximum authentication attempts exceeded');
        }
      }
    } catch (err: any) {
      setErrorMessage('Authentication failed. Please try again.');
      setAttempts(prev => prev + 1);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getErrorMessage = (error?: string): string => {
    switch (error) {
      case 'user_cancel':
        return 'Authentication cancelled';
      case 'system_cancel':
        return 'Authentication was cancelled by the system';
      case 'not_enrolled':
        return 'No biometric credentials enrolled';
      case 'lockout':
        return 'Too many failed attempts. Please try again later.';
      case 'lockout_permanent':
        return 'Biometric authentication is locked. Use your device PIN.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>

          {/* Biometric Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getBiometricIcon() as any}
              size={64}
              color="#3498db"
            />
            <Text variant="titleMedium" style={styles.biometricLabel}>
              {getBiometricLabel()}
            </Text>
          </View>

          {/* Error Message */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text variant="bodyMedium" style={styles.errorText}>
                {errorMessage}
              </Text>
              <Text variant="bodySmall" style={styles.attemptsText}>
                {MAX_ATTEMPTS - attempts} attempt(s) remaining
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onCancel}
              disabled={isAuthenticating}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={authenticate}
              disabled={isAuthenticating || attempts >= MAX_ATTEMPTS}
              loading={isAuthenticating}
              style={styles.authButton}
              buttonColor="#27ae60"
            >
              {attempts > 0 ? 'Try Again' : 'Authenticate'}
            </Button>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <MaterialCommunityIcons name="shield-lock" size={16} color="#95a5a6" />
            <Text variant="bodySmall" style={styles.securityText}>
              Your signature is legally binding under Egyptian e-signature law
            </Text>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  biometricLabel: {
    color: '#3498db',
    marginTop: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fdeaea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
  },
  attemptsText: {
    color: '#c0392b',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  authButton: {
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    width: '100%',
    justifyContent: 'center',
  },
  securityText: {
    color: '#95a5a6',
    flex: 1,
  },
});

export default BiometricPrompt;
