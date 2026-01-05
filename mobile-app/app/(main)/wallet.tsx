/**
 * HealthFlow Mobile App - Wallet Screen
 * 
 * Digital wallet for managing verifiable credentials.
 * Updated: January 5, 2026 - Added Credentials Service integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Modal, Alert } from 'react-native';
import { 
  Text, 
  FAB, 
  Portal, 
  Dialog, 
  Button, 
  ActivityIndicator, 
  Snackbar,
  TextInput,
  Chip,
  Menu,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import {
  useAppDispatch,
  useAppSelector,
  selectCredentials,
  selectUserDID,
  selectCredentialsLoading,
  selectCredentialsSyncing,
  selectCredentialsIssuing,
  selectCredentialsError,
  selectLastSyncTime,
  selectActiveCredentials,
  selectExpiringCredentials,
  loadUserDID,
  generateUserDID,
  fetchCredentials,
  syncCredentials,
  issueCredential,
  verifyCredential,
  clearError,
} from '../../store';
import { CredentialCard } from '../../components';
import CredentialsService from '../../services/credentials.service';
import VerificationService from '../../services/verification.service';
import { Credential, CredentialType, CredentialRequestForm } from '../../types';

const CREDENTIAL_TYPES: { value: CredentialType; label: string }[] = [
  { value: 'MedicalLicenseCredential', label: 'Medical License' },
  { value: 'DoctorCredential', label: 'Doctor Credential' },
  { value: 'NurseCredential', label: 'Nurse Credential' },
  { value: 'PharmacistCredential', label: 'Pharmacist Credential' },
  { value: 'DentistCredential', label: 'Dentist Credential' },
  { value: 'PhysiotherapistCredential', label: 'Physiotherapist Credential' },
];

const WalletScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const activeCredentials = useAppSelector(selectActiveCredentials);
  const expiringCredentials = useAppSelector(selectExpiringCredentials);
  const userDID = useAppSelector(selectUserDID);
  const isLoading = useAppSelector(selectCredentialsLoading);
  const isSyncing = useAppSelector(selectCredentialsSyncing);
  const isIssuing = useAppSelector(selectCredentialsIssuing);
  const error = useAppSelector(selectCredentialsError);
  const lastSyncTime = useAppSelector(selectLastSyncTime);

  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [showDIDDialog, setShowDIDDialog] = useState(false);
  const [generatingDID, setGeneratingDID] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring'>('all');
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Request form state
  const [requestForm, setRequestForm] = useState<CredentialRequestForm>({
    credentialType: 'MedicalLicenseCredential',
    professionalName: '',
    licenseNumber: '',
    specialty: '',
    nationalId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(loadUserDID());
    dispatch(fetchCredentials());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(syncCredentials());
    setRefreshing(false);
  }, [dispatch]);

  const handleShowQR = (credential: Credential) => {
    setSelectedCredential(credential);
    setShowQRModal(true);
  };

  const handleCredentialPress = (credential: Credential) => {
    Alert.alert(
      'Credential Details',
      `Type: ${CredentialsService.formatCredentialType(credential.type)}\n` +
      `Issued: ${new Date(credential.issuanceDate).toLocaleDateString()}\n` +
      `Status: ${CredentialsService.getCredentialStatus(credential)}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Verify', onPress: () => handleVerifyCredential(credential) },
      ]
    );
  };

  const handleVerifyCredential = async (credential: Credential) => {
    if (!credential.id) return;
    
    const result = await dispatch(verifyCredential(credential.id));
    
    if (verifyCredential.fulfilled.match(result)) {
      const verification = result.payload.verification;
      const isValid = verification.status === 'ISSUED';
      
      setSnackbar({
        visible: true,
        message: isValid ? 'Credential verified successfully!' : `Credential status: ${verification.status}`,
        type: isValid ? 'success' : 'error',
      });
    } else {
      setSnackbar({
        visible: true,
        message: 'Verification failed',
        type: 'error',
      });
    }
  };

  const handleGenerateDID = async () => {
    setGeneratingDID(true);
    try {
      await dispatch(generateUserDID(undefined));
      setShowDIDDialog(false);
      setSnackbar({
        visible: true,
        message: 'Digital Identity generated successfully!',
        type: 'success',
      });
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to generate DID',
        type: 'error',
      });
    } finally {
      setGeneratingDID(false);
    }
  };

  const handleRequestCredential = async () => {
    if (!userDID) {
      setSnackbar({
        visible: true,
        message: 'Please generate a Digital Identity first',
        type: 'error',
      });
      return;
    }

    if (!requestForm.professionalName || !requestForm.licenseNumber) {
      setSnackbar({
        visible: true,
        message: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    const request = CredentialsService.buildCredentialRequest(
      requestForm.credentialType,
      userDID.id,
      {
        name: requestForm.professionalName,
        licenseNumber: requestForm.licenseNumber,
        specialty: requestForm.specialty,
        nationalId: requestForm.nationalId,
        professionalType: requestForm.credentialType.replace('Credential', ''),
        licenseStatus: 'active',
      },
      requestForm.credentialType,
      '1.0.0'
    );

    const result = await dispatch(issueCredential(request));

    if (issueCredential.fulfilled.match(result)) {
      setShowRequestDialog(false);
      setRequestForm({
        credentialType: 'MedicalLicenseCredential',
        professionalName: '',
        licenseNumber: '',
        specialty: '',
        nationalId: '',
      });
      setSnackbar({
        visible: true,
        message: 'Credential requested successfully!',
        type: 'success',
      });
    } else {
      setSnackbar({
        visible: true,
        message: error || 'Failed to request credential',
        type: 'error',
      });
    }
  };

  const getQRData = (): string => {
    if (!userDID) return '';
    return VerificationService.generateQRData(
      userDID.id,
      selectedCredential?.id
    );
  };

  const getFilteredCredentials = () => {
    switch (filter) {
      case 'active':
        return activeCredentials;
      case 'expiring':
        return expiringCredentials;
      default:
        return credentials;
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const date = new Date(lastSyncTime);
    return date.toLocaleTimeString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Digital Wallet
            </Text>
            <Text variant="bodySmall" style={styles.syncText}>
              Last sync: {formatLastSync()}
            </Text>
          </View>
          <Button
            mode="contained"
            compact
            onPress={() => setShowRequestDialog(true)}
            disabled={!userDID}
            icon="plus"
          >
            Request
          </Button>
        </View>
      </View>

      {/* Expiring Credentials Warning */}
      {expiringCredentials.length > 0 && (
        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="alert" size={20} color="#f39c12" />
          <Text variant="bodySmall" style={styles.warningText}>
            {expiringCredentials.length} credential(s) expiring soon
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing || isSyncing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* DID Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            My Digital Identity
          </Text>
          
          {isLoading && !userDID ? (
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
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              My Credentials
            </Text>
            <Text variant="bodySmall" style={styles.credentialCount}>
              {credentials.length} total
            </Text>
          </View>

          {/* Filter Chips */}
          <View style={styles.filters}>
            <Chip
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              style={styles.filterChip}
              compact
            >
              All ({credentials.length})
            </Chip>
            <Chip
              selected={filter === 'active'}
              onPress={() => setFilter('active')}
              style={styles.filterChip}
              compact
            >
              Active ({activeCredentials.length})
            </Chip>
            <Chip
              selected={filter === 'expiring'}
              onPress={() => setFilter('expiring')}
              style={[styles.filterChip, expiringCredentials.length > 0 && styles.warningChip]}
              compact
            >
              Expiring ({expiringCredentials.length})
            </Chip>
          </View>

          {isLoading && credentials.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading credentials...
              </Text>
            </View>
          ) : getFilteredCredentials().length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={64}
                color="#bdc3c7"
              />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {filter === 'all' ? 'No Credentials Yet' : `No ${filter} credentials`}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? 'Request a credential to get started'
                  : 'Try a different filter'}
              </Text>
              {filter === 'all' && userDID && (
                <Button
                  mode="outlined"
                  onPress={() => setShowRequestDialog(true)}
                  style={styles.requestButton}
                  icon="plus"
                >
                  Request Credential
                </Button>
              )}
            </View>
          ) : (
            getFilteredCredentials().map((credential, index) => (
              <CredentialCard
                key={credential.id || index}
                credential={credential}
                onPress={() => handleCredentialPress(credential)}
                onShowQR={() => handleShowQR(credential)}
                status={CredentialsService.getCredentialStatus(credential)}
                icon={CredentialsService.getCredentialIcon(credential.type)}
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
                  {CredentialsService.formatCredentialType(selectedCredential.type)}
                </Text>
                <Text variant="bodySmall" style={styles.qrCredentialSubtext}>
                  {selectedCredential.credentialSubject?.name || 'Professional Credential'}
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

      {/* Request Credential Dialog */}
      <Portal>
        <Dialog 
          visible={showRequestDialog} 
          onDismiss={() => setShowRequestDialog(false)}
          style={styles.requestDialog}
        >
          <Dialog.Title>Request New Credential</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <View style={styles.formContainer}>
                <Text variant="bodySmall" style={styles.formDescription}>
                  Request a verifiable credential based on your professional information.
                </Text>

                <Menu
                  visible={showTypeMenu}
                  onDismiss={() => setShowTypeMenu(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setShowTypeMenu(true)}
                      style={styles.typeButton}
                      contentStyle={styles.typeButtonContent}
                    >
                      {CREDENTIAL_TYPES.find(t => t.value === requestForm.credentialType)?.label || 'Select Type'}
                    </Button>
                  }
                >
                  {CREDENTIAL_TYPES.map((type) => (
                    <Menu.Item
                      key={type.value}
                      onPress={() => {
                        setRequestForm({ ...requestForm, credentialType: type.value });
                        setShowTypeMenu(false);
                      }}
                      title={type.label}
                    />
                  ))}
                </Menu>

                <TextInput
                  mode="outlined"
                  label="Professional Name *"
                  value={requestForm.professionalName}
                  onChangeText={(text) => setRequestForm({ ...requestForm, professionalName: text })}
                  style={styles.input}
                  placeholder="Dr. Ahmed Hassan"
                />

                <TextInput
                  mode="outlined"
                  label="License Number *"
                  value={requestForm.licenseNumber}
                  onChangeText={(text) => setRequestForm({ ...requestForm, licenseNumber: text })}
                  style={styles.input}
                  placeholder="MED-2024-12345"
                />

                <TextInput
                  mode="outlined"
                  label="Specialty"
                  value={requestForm.specialty}
                  onChangeText={(text) => setRequestForm({ ...requestForm, specialty: text })}
                  style={styles.input}
                  placeholder="Cardiology"
                />

                <TextInput
                  mode="outlined"
                  label="National ID"
                  value={requestForm.nationalId}
                  onChangeText={(text) => setRequestForm({ ...requestForm, nationalId: text })}
                  style={styles.input}
                  placeholder="29012345678901"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowRequestDialog(false)} disabled={isIssuing}>
              Cancel
            </Button>
            <Button
              onPress={handleRequestCredential}
              loading={isIssuing}
              disabled={isIssuing || !requestForm.professionalName || !requestForm.licenseNumber}
            >
              Submit Request
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={snackbar.type === 'error' ? styles.errorSnackbar : styles.successSnackbar}
      >
        {snackbar.message}
      </Snackbar>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  syncText: {
    color: '#95a5a6',
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9e7',
    padding: 12,
    gap: 8,
  },
  warningText: {
    color: '#9a7b4f',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  credentialCount: {
    color: '#95a5a6',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
  },
  warningChip: {
    backgroundColor: '#fef9e7',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#7f8c8d',
    marginTop: 12,
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
  requestButton: {
    marginTop: 16,
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
  requestDialog: {
    maxHeight: '80%',
  },
  dialogScrollArea: {
    paddingHorizontal: 0,
  },
  formContainer: {
    padding: 16,
  },
  formDescription: {
    color: '#7f8c8d',
    marginBottom: 16,
  },
  typeButton: {
    marginBottom: 16,
  },
  typeButtonContent: {
    justifyContent: 'flex-start',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  successSnackbar: {
    backgroundColor: '#27ae60',
  },
  errorSnackbar: {
    backgroundColor: '#e74c3c',
  },
});

export default WalletScreen;
