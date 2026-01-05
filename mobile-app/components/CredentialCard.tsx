/**
 * HealthFlow Mobile App - CredentialCard Component
 * 
 * Displays a professional credential in the wallet.
 * Updated: January 5, 2026 - Added support for all credential types from Credentials Service
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Credential, ProfessionalCredential } from '../types';

interface CredentialCardProps {
  credential: Credential | ProfessionalCredential;
  onPress?: (credential: Credential) => void;
  onShowQR?: (credential: Credential) => void;
  status?: 'active' | 'expired' | 'expiring' | 'revoked';
  icon?: string;
}

// Configuration for different credential types
const credentialTypeConfig: Record<string, { icon: string; color: string }> = {
  Doctor: { icon: 'stethoscope', color: '#3498db' },
  DoctorCredential: { icon: 'stethoscope', color: '#3498db' },
  Nurse: { icon: 'hospital-box', color: '#27ae60' },
  NurseCredential: { icon: 'hospital-box', color: '#27ae60' },
  Pharmacist: { icon: 'pill', color: '#9b59b6' },
  PharmacistCredential: { icon: 'pill', color: '#9b59b6' },
  Dentist: { icon: 'tooth', color: '#e67e22' },
  DentistCredential: { icon: 'tooth', color: '#e67e22' },
  Physiotherapist: { icon: 'human-handsup', color: '#1abc9c' },
  PhysiotherapistCredential: { icon: 'human-handsup', color: '#1abc9c' },
  MedicalLicense: { icon: 'card-account-details', color: '#2c3e50' },
  MedicalLicenseCredential: { icon: 'card-account-details', color: '#2c3e50' },
  default: { icon: 'certificate', color: '#95a5a6' },
};

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onPress,
  onShowQR,
  status,
  icon,
}) => {
  const subject = credential.credentialSubject;
  
  // Determine credential type from the type array
  const credentialType = credential.type.find(t => t !== 'VerifiableCredential') || 'default';
  const config = credentialTypeConfig[credentialType] || credentialTypeConfig.default;
  
  // Use provided icon or fall back to config
  const displayIcon = icon || config.icon;

  // Determine status
  const isExpired = credential.expirationDate 
    ? new Date(credential.expirationDate) <= new Date()
    : false;
  
  const isExpiringSoon = credential.expirationDate
    ? (() => {
        const expiryDate = new Date(credential.expirationDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
      })()
    : false;

  const credentialStatus = status || (
    credential.status === 'revoked' ? 'revoked' :
    isExpired ? 'expired' :
    isExpiringSoon ? 'expiring' :
    'active'
  );

  const isActive = credentialStatus === 'active';

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = () => {
    switch (credentialStatus) {
      case 'active': return '#27ae60';
      case 'expiring': return '#f39c12';
      case 'expired': return '#e74c3c';
      case 'revoked': return '#c0392b';
      default: return '#95a5a6';
    }
  };

  const getStatusText = () => {
    switch (credentialStatus) {
      case 'active': return 'ACTIVE';
      case 'expiring': return 'EXPIRING SOON';
      case 'expired': return 'EXPIRED';
      case 'revoked': return 'REVOKED';
      default: return 'UNKNOWN';
    }
  };

  // Format credential type for display
  const formatCredentialType = () => {
    return credentialType
      .replace(/Credential$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  // Get subject display name
  const getDisplayName = () => {
    return subject.name as string || 
           subject.professionalName as string || 
           'Professional Credential';
  };

  // Get specialty or type
  const getSpecialty = () => {
    return subject.specialty as string || 
           subject.specialization as string || 
           subject.professionalType as string ||
           formatCredentialType();
  };

  return (
    <Card
      style={[styles.card, !isActive && styles.inactiveCard]}
      onPress={() => onPress?.(credential)}
    >
      {/* Header with colored background */}
      <View style={[styles.header, { backgroundColor: config.color }]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name={displayIcon as any} size={32} color="#fff" />
          <View style={styles.headerText}>
            <Text variant="titleLarge" style={styles.name} numberOfLines={1}>
              {getDisplayName()}
            </Text>
            <Text variant="bodyMedium" style={styles.type} numberOfLines={1}>
              {getSpecialty()}
            </Text>
          </View>
        </View>
        
        <Chip
          mode="flat"
          style={[
            styles.statusChip, 
            { backgroundColor: credentialStatus === 'active' ? 'rgba(255,255,255,0.2)' : getStatusColor() }
          ]}
          textStyle={styles.statusText}
        >
          {getStatusText()}
        </Chip>
      </View>

      <Card.Content style={styles.content}>
        {/* Details */}
        <View style={styles.detailsGrid}>
          {subject.syndicateNumber && (
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={styles.detailLabel}>
                Syndicate Number
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {subject.syndicateNumber as string}
              </Text>
            </View>
          )}
          
          {subject.licenseNumber && (
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={styles.detailLabel}>
                License Number
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {subject.licenseNumber as string}
              </Text>
            </View>
          )}

          {subject.nationalId && (
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={styles.detailLabel}>
                National ID
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {(subject.nationalId as string).slice(0, 4)}****
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>
              Issued
            </Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {formatDate(credential.issuanceDate)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>
              Expires
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.detailValue, 
                (credentialStatus === 'expired' || credentialStatus === 'expiring') && styles.warningText
              ]}
            >
              {formatDate(credential.expirationDate)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => onShowQR?.(credential)}
          >
            <MaterialCommunityIcons name="qrcode" size={20} color="#3498db" />
            <Text variant="labelLarge" style={styles.qrButtonText}>
              Show QR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verified badge */}
        {credential.proof && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#27ae60" />
            <Text variant="bodySmall" style={styles.verifiedText}>
              Verified Credential
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  inactiveCard: {
    opacity: 0.7,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    color: '#fff',
    fontWeight: '700',
  },
  type: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    paddingTop: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#95a5a6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#2c3e50',
    fontWeight: '500',
    marginTop: 2,
  },
  warningText: {
    color: '#e74c3c',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 12,
    marginTop: 4,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ebf5fb',
  },
  qrButtonText: {
    color: '#3498db',
    marginLeft: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  verifiedText: {
    color: '#27ae60',
  },
});

export default CredentialCard;
