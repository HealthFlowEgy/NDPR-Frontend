/**
 * HealthFlow Mobile App - Wallet Screen
 * 
 * Digital wallet for managing verifiable credentials.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Modal } from 'react-native';
import { Text, FAB, Portal, Dialog, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import {
  useAppDispatch,
  useAppSelector,
  selectCredentials,
  selectUserDID,
  selectCredentialsLoading,
  loadUserDID,
  generateUserDID,
} from '../../store';
import { CredentialCard } from '../../components';
import VerificationService from '../../services/verification.service';
import { ProfessionalCredential } from '../../types';

const WalletScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const userDID = useAppSelector(selectUserDID);
  const isLoading = useAppSelector(selectCredentialsLoading);

  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<ProfessionalCredential | null>(null);
  const [showDIDDialog, setShowDIDDialog] = useState(false);
  const [generatingDID, setGeneratingDID] = useState(false);

  useEffect(() => {
    dispatch(loadUserDID());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(loadUserDID());
    setRefreshing(false);
  };

  const handleShowQR = (credential: ProfessionalCredential) => {
    setSelectedCredential(credential);
    setShowQRModal(true);
  };

  const handleCredentialPress = (credential: ProfessionalCredential) => {
    // Could navigate to detail screen
    console.log('Credential pressed:', credential.id);
  };

  const handleGenerateDID = async () => {
    setGeneratingDID(true);
    try {
      await dispatch(generateUserDID(undefined));
      setShowDIDDialog(false);
    } catch (error) {
      console.error('Failed to generate DID:', error);
    } finally {
      setGeneratingDID(false);
    }
  };

  const getQRData = (): string => {
    if (!userDID) return '';
    return VerificationService.generateQRData(
      userDID.id,
      selectedCredential?.id
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Digital Wallet
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* DID Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            My Digital Identity
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
            </View>
          ) : userDID ? (
            <View style={styles.didCard}>
              <MaterialCommunityIcons name="account-key" size={32} color="#3498db" />
              <View style={styles.didInfo}>
                <Text variant="labelSmall" style={styles.didLabel}>
                  Decentralized Identifier (DID)
                </Text>
                <Text variant="bodySmall" style={styles.didValue} numberOfLines={1}>
                  {userDID.id}
                </Text>
              </View>
              <MaterialCommunityIcons name="check-decagram" size={24} color="#27ae60" />
            </View>
          ) : (
            <View style={styles.noDIDCard}>
              <MaterialCommunityIcons name="account-key-outline" size={48} color="#bdc3c7" />
              <Text variant="bodyMedium" style={styles.noDIDText}>
                No Digital Identity configured
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowDIDDialog(true)}
                style={styles.generateButton}
              >
                Generate DID
              </Button>
            </View>
          )}
        </View>

        {/* Credentials Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            My Credentials
          </Text>

          {credentials.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={64}
                color="#bdc3c7"
              />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No Credentials Yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Your verified professional credentials will appear here
              </Text>
            </View>
          ) : (
            credentials.map((credential, index) => (
              <CredentialCard
                key={credential.id || index}
                credential={credential}
                onPress={handleCredentialPress}
                onShowQR={handleShowQR}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <Text variant="titleLarge" style={styles.qrModalTitle}>
              Scan to Verify
            </Text>
            <Text variant="bodyMedium" style={styles.qrModalSubtitle}>
              Present this QR code for credential verification
            </Text>
            
            <View style={styles.qrContainer}>
              {userDID && (
                <QRCode
                  value={getQRData()}
                  size={220}
                  backgroundColor="#fff"
                  color="#2c3e50"
                />
              )}
            </View>

            {selectedCredential && (
              <View style={styles.qrCredentialInfo}>
                <Text variant="titleSmall">
                  {selectedCredential.credentialSubject.professionalType}
                </Text>
                <Text variant="bodySmall" style={styles.qrCredentialSubtext}>
                  {selectedCredential.credentialSubject.name}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => setShowQRModal(false)}
              style={styles.qrCloseButton}
            >
              Close
            </Button>
          </View>
        </View>
      </Modal>

      {/* Generate DID Dialog */}
      <Portal>
        <Dialog visible={showDIDDialog} onDismiss={() => setShowDIDDialog(false)}>
          <Dialog.Title>Generate Digital Identity</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will create a Decentralized Identifier (DID) for your professional identity. 
              Your DID will be used to sign documents and verify your credentials.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDIDDialog(false)} disabled={generatingDID}>
              Cancel
            </Button>
            <Button
              onPress={handleGenerateDID}
              loading={generatingDID}
              disabled={generatingDID}
            >
              Generate
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  didCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
  },
  didInfo: {
    flex: 1,
  },
  didLabel: {
    color: '#95a5a6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  didValue: {
    color: '#2c3e50',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  noDIDCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  noDIDText: {
    color: '#7f8c8d',
    marginTop: 12,
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  qrModalTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  qrModalSubtitle: {
    color: '#7f8c8d',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  qrCredentialInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCredentialSubtext: {
    color: '#7f8c8d',
    marginTop: 4,
  },
  qrCloseButton: {
    width: '100%',
  },
});

export default WalletScreen;
