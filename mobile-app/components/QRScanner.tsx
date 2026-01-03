/**
 * HealthFlow Mobile App - QRScanner Component
 * 
 * Camera-based QR code scanner for credential verification.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  CameraPermissionStatus,
} from 'react-native-vision-camera';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  isProcessing = false,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [torch, setTorch] = useState(false);

  const device = useCameraDevice('back');

  // Request camera permission
  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'granted');
  };

  // Code scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !isProcessing) {
        setIsActive(false);
        onScan(codes[0].value);
      }
    },
  });

  const handleRescan = useCallback(() => {
    setIsActive(true);
  }, []);

  // Loading state
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  // No permission state
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#e74c3c" />
        <Text variant="titleMedium" style={styles.errorTitle}>
          Camera Access Required
        </Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          Please grant camera permission to scan QR codes.
        </Text>
        <Button
          mode="contained"
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          Grant Permission
        </Button>
        <Button mode="text" onPress={onClose}>
          Go Back
        </Button>
      </View>
    );
  }

  // No camera device
  if (!device) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#e74c3c" />
        <Text variant="titleMedium" style={styles.errorTitle}>
          No Camera Found
        </Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          Unable to access camera device.
        </Text>
        <Button mode="text" onPress={onClose}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive && !isProcessing}
        codeScanner={codeScanner}
        torch={torch ? 'on' : 'off'}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top section */}
        <View style={styles.overlaySection}>
          <View style={styles.header}>
            <IconButton
              icon="close"
              iconColor="#fff"
              size={28}
              onPress={onClose}
            />
            <Text variant="titleMedium" style={styles.headerTitle}>
              Scan QR Code
            </Text>
            <IconButton
              icon={torch ? 'flashlight-off' : 'flashlight'}
              iconColor="#fff"
              size={28}
              onPress={() => setTorch(!torch)}
            />
          </View>
        </View>

        {/* Scan area */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.overlayLeft} />
          <View style={styles.scanArea}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Processing indicator */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text variant="bodyMedium" style={styles.processingText}>
                  Verifying...
                </Text>
              </View>
            )}
          </View>
          <View style={styles.overlayRight} />
        </View>

        {/* Bottom section */}
        <View style={styles.overlaySection}>
          <Text variant="bodyMedium" style={styles.instructions}>
            Position the QR code within the frame
          </Text>
          
          {!isActive && (
            <Button
              mode="contained"
              onPress={handleRescan}
              style={styles.rescanButton}
            >
              Scan Again
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
  },
  errorTitle: {
    color: '#fff',
    marginTop: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  permissionButton: {
    marginTop: 24,
    marginBottom: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  scanAreaContainer: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3498db',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  processingText: {
    color: '#fff',
    marginTop: 12,
  },
  instructions: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  rescanButton: {
    marginTop: 16,
  },
});

export default QRScanner;
