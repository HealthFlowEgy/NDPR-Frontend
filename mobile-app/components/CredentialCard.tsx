/**
 * HealthFlow Mobile App - CredentialCard Component
 * 
 * Displays a professional credential in the wallet.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfessionalCredential, ProfessionalType } from '../types';

interface CredentialCardProps {
  credential: ProfessionalCredential;
  onPress?: (credential: ProfessionalCredential) => void;
  onShowQR?: (credential: ProfessionalCredential) => void;
}

const professionalTypeConfig: Record<ProfessionalType, { icon: string; color: string; gradient: string[] }> = {
  Doctor: { icon: 'stethoscope', color: '#3498db', gradient: ['#3498db', '#2980b9'] },
  Nurse: { icon: 'hospital-box', color: '#27ae60', gradient: ['#27ae60', '#1e8449'] },
  Pharmacist: { icon: 'pill', color: '#9b59b6', gradient: ['#9b59b6', '#8e44ad'] },
};

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onPress,
  onShowQR,
}) => {
  const subject = credential.credentialSubject;
  const config = professionalTypeConfig[subject.professionalType] || {
    icon: 'badge-account',
    color: '#95a5a6',
    gradient: ['#95a5a6', '#7f8c8d'],
  };

  const isExpired = credential.expirationDate 
    ? new Date(credential.expirationDate) <= new Date()
    : false;

  const isActive = subject.licenseStatus === 'active' && !isExpired;

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card
      style={[styles.card, !isActive && styles.inactiveCard]}
      onPress={() => onPress?.(credential)}
    >
      {/* Header with gradient-like appearance */}
      <View style={[styles.header, { backgroundColor: config.color }]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name={config.icon as any} size={32} color="#fff" />
          <View style={styles.headerText}>
            <Text variant="titleLarge" style={styles.name}>
              {subject.name}
            </Text>
            <Text variant="bodyMedium" style={styles.type}>
              {subject.professionalType}
              {subject.specialization && ` - ${subject.specialization}`}
            </Text>
          </View>
        </View>
        
        <Chip
          mode="flat"
          style={[styles.statusChip, !isActive && styles.inactiveChip]}
          textStyle={styles.statusText}
        >
          {isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : subject.licenseStatus.toUpperCase()}
        </Chip>
      </View>

      <Card.Content style={styles.content}>
        {/* Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>
              Syndicate Number
            </Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {subject.syndicateNumber}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>
              National ID
            </Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {subject.nationalId}
            </Text>
          </View>

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
              style={[styles.detailValue, isExpired && styles.expiredText]}
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
        <View style={styles.verifiedBadge}>
          <MaterialCommunityIcons name="check-decagram" size={16} color="#27ae60" />
          <Text variant="bodySmall" style={styles.verifiedText}>
            Verified Credential
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  inactiveChip: {
    backgroundColor: '#e74c3c',
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
  expiredText: {
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
