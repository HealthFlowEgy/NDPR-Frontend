/**
 * HealthFlow Mobile App - QRScanner Component
 * 
 * Camera-based QR code scanner for credential verification.
 * Uses expo-camera for Expo SDK 52 compatibility.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  isProcessing = false,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(true);
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (result.data && !isProcessing && !scanned) {
      setScanned(true);
      setIsActive(false);
      onScan(result.data);
    }
  }, [isProcessing, scanned, onScan]);

  const handleRescan = useCallback(() => {
    setScanned(false);
    setIsActive(true);
  }, []);

  // Loading state
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e3a5f" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  // No permission state
  if (!permission.granted) {
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
          buttonColor="#1e3a5f"
        >
          Grant Permission
        </Button>
        <Button mode="text" onPress={onClose} textColor="#1e3a5f">
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={isActive && !isProcessing ? handleBarCodeScanned : undefined}
        enableTorch={torch}
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
              buttonColor="#1e3a5f"
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
    borderColor: '#c9a227',
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
