/**
 * HealthFlow Mobile App - SigningRequestCard Component
 * 
 * Displays a signing request with actions.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SigningRequest, DocumentType } from '../types';

interface SigningRequestCardProps {
  request: SigningRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPress: (id: string) => void;
  isProcessing?: boolean;
}

// Document type icons and colors
const documentTypeConfig: Record<DocumentType, { icon: string; color: string; label: string }> = {
  prescription: { icon: 'pill', color: '#3498db', label: 'Prescription' },
  medical_certificate: { icon: 'file-document', color: '#27ae60', label: 'Medical Certificate' },
  referral_letter: { icon: 'email-send', color: '#9b59b6', label: 'Referral Letter' },
  dispensing_record: { icon: 'hospital-building', color: '#e67e22', label: 'Dispensing Record' },
  pre_authorization: { icon: 'check-decagram', color: '#1abc9c', label: 'Pre-Authorization' },
  lab_report: { icon: 'flask', color: '#e74c3c', label: 'Lab Report' },
};

const SigningRequestCard: React.FC<SigningRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  onPress,
  isProcessing = false,
}) => {
  const config = documentTypeConfig[request.document_type] || {
    icon: 'file',
    color: '#95a5a6',
    label: 'Document',
  };

  const isExpired = new Date(request.expires_at) <= new Date();
  const isUrgent = request.priority === 'urgent';

  const formatTimeRemaining = (): string => {
    const now = new Date();
    const expiry = new Date(request.expires_at);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m left`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m left`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-EG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      style={[
        styles.card,
        isUrgent && styles.urgentCard,
        isExpired && styles.expiredCard,
      ]}
      onPress={() => onPress(request.id)}
    >
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
            <MaterialCommunityIcons name={config.icon as any} size={24} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={styles.title}>
              {config.label}
            </Text>
            <Text variant="bodySmall" style={styles.requester}>
              {request.requester_name}
            </Text>
          </View>
          {isUrgent && (
            <Chip
              mode="flat"
              style={styles.urgentChip}
              textStyle={styles.urgentChipText}
            >
              URGENT
            </Chip>
          )}
        </View>

        {/* Patient info */}
        {request.patient_name && (
          <View style={styles.patientRow}>
            <MaterialCommunityIcons name="account" size={16} color="#7f8c8d" />
            <Text variant="bodyMedium" style={styles.patientName}>
              {request.patient_name}
            </Text>
          </View>
        )}

        {/* Time info */}
        <View style={styles.timeRow}>
          <Text variant="bodySmall" style={styles.timeText}>
            {formatDate(request.created_at)}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.expiryText, isExpired && styles.expiredText]}
          >
            {formatTimeRemaining()}
          </Text>
        </View>

        {/* Actions */}
        {!isExpired && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => onReject(request.id)}
              disabled={isProcessing}
              style={styles.rejectButton}
              textColor="#7f8c8d"
            >
              Reject
            </Button>
            <Button
              mode="contained"
              onPress={() => onApprove(request.id)}
              disabled={isProcessing}
              loading={isProcessing}
              style={styles.approveButton}
              buttonColor="#27ae60"
            >
              Sign
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  expiredCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  requester: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  urgentChip: {
    backgroundColor: '#e74c3c',
  },
  urgentChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  patientName: {
    marginLeft: 8,
    color: '#2c3e50',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeText: {
    color: '#95a5a6',
  },
  expiryText: {
    color: '#e67e22',
    fontWeight: '500',
  },
  expiredText: {
    color: '#e74c3c',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  rejectButton: {
    borderColor: '#bdc3c7',
  },
  approveButton: {},
});

export default SigningRequestCard;
