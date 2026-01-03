/**
 * HealthFlow Mobile App - Scanner Screen
 * 
 * QR code scanner for credential verification.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QRScanner } from '../../components';
import VerificationService from '../../services/verification.service';
import { VerificationResult } from '../../types';

type ScanStatus = 'idle' | 'scanning' | 'verifying' | 'result';

const ScannerScreen: React.FC = () => {
  const router = useRouter();
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleStartScan = () => {
    setStatus('scanning');
    setResult(null);
  };

  const handleScanResult = useCallback(async (data: string) => {
    setStatus('verifying');
    
    try {
      const verificationResult = await VerificationService.verifyFromQR(data);
      setResult(verificationResult);
      setStatus('result');
    } catch (error: any) {
      setResult({
        isValid: false,
        error: error.message || 'Verification failed',
      });
      setStatus('result');
    }
  }, []);

  const handleClose = () => {
    setStatus('idle');
    setResult(null);
  };

  const handleScanAgain = () => {
    setResult(null);
    setStatus('scanning');
  };

  const formatResult = result ? VerificationService.formatResult(result) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Verify Credential
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Scan a QR code to verify credentials
        </Text>
      </View>

      <View style={styles.content}>
        {status === 'idle' && (
          <View style={styles.idleState}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="qrcode-scan" size={80} color="#3498db" />
            </View>
            
            <Text variant="titleLarge" style={styles.idleTitle}>
              Ready to Scan
            </Text>
            <Text variant="bodyMedium" style={styles.idleSubtitle}>
              Position a healthcare professional's QR code in front of your camera to verify their credentials
            </Text>

            <Button
              mode="contained"
              onPress={handleStartScan}
              style={styles.scanButton}
              contentStyle={styles.scanButtonContent}
              icon="camera"
            >
              Start Scanning
            </Button>

            <View style={styles.infoCards}>
              <Card style={styles.infoCard}>
                <Card.Content style={styles.infoCardContent}>
                  <MaterialCommunityIcons name="shield-check" size={24} color="#27ae60" />
                  <Text variant="bodySmall" style={styles.infoCardText}>
                    Instant verification against the blockchain registry
                  </Text>
                </Card.Content>
              </Card>
              
              <Card style={styles.infoCard}>
                <Card.Content style={styles.infoCardContent}>
                  <MaterialCommunityIcons name="lock" size={24} color="#3498db" />
                  <Text variant="bodySmall" style={styles.infoCardText}>
                    Cryptographically secured credentials
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </View>
        )}

        {status === 'result' && formatResult && (
          <View style={styles.resultState}>
            <View
              style={[
                styles.resultIconContainer,
                formatResult.status === 'valid'
                  ? styles.validResult
                  : styles.invalidResult,
              ]}
            >
              <MaterialCommunityIcons
                name={formatResult.status === 'valid' ? 'check-circle' : 'alert-circle'}
                size={80}
                color="#fff"
              />
            </View>

            <Text variant="headlineSmall" style={styles.resultTitle}>
              {formatResult.title}
            </Text>
            <Text variant="bodyMedium" style={styles.resultMessage}>
              {formatResult.message}
            </Text>

            {formatResult.details && (
              <Card style={styles.detailsCard}>
                <Card.Content>
                  {Object.entries(formatResult.details).map(([key, value]) => (
                    <View key={key} style={styles.detailRow}>
                      <Text variant="labelMedium" style={styles.detailLabel}>
                        {key}
                      </Text>
                      <Text variant="bodyMedium" style={styles.detailValue} numberOfLines={1}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            <View style={styles.resultActions}>
              <Button
                mode="outlined"
                onPress={handleScanAgain}
                style={styles.resultButton}
                icon="camera"
              >
                Scan Again
              </Button>
              <Button
                mode="contained"
                onPress={handleClose}
                style={styles.resultButton}
              >
                Done
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* Scanner Modal */}
      <Modal
        visible={status === 'scanning' || status === 'verifying'}
        animationType="slide"
        onRequestClose={handleClose}
      >
        {status === 'scanning' && (
          <QRScanner
            onScan={handleScanResult}
            onClose={handleClose}
            isProcessing={false}
          />
        )}
        
        {status === 'verifying' && (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text variant="titleMedium" style={styles.verifyingText}>
              Verifying Credential...
            </Text>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerTitle: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  headerSubtitle: {
    color: '#7f8c8d',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  idleState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ebf5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  idleTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  idleSubtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  scanButton: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 32,
  },
  scanButtonContent: {
    paddingVertical: 8,
  },
  infoCards: {
    width: '100%',
    gap: 12,
  },
  infoCard: {
    borderRadius: 12,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCardText: {
    flex: 1,
    color: '#2c3e50',
  },
  resultState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  validResult: {
    backgroundColor: '#27ae60',
  },
  invalidResult: {
    backgroundColor: '#e74c3c',
  },
  resultTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  resultMessage: {
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailLabel: {
    color: '#7f8c8d',
  },
  detailValue: {
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  resultButton: {
    flex: 1,
    borderRadius: 12,
  },
  verifyingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  verifyingText: {
    color: '#fff',
    marginTop: 16,
  },
});

export default ScannerScreen;
