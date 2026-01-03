/**
 * HealthFlow Mobile App - Signing Requests Screen
 * 
 * Lists pending signing requests with approve/reject actions.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Snackbar, Portal, Dialog, Button, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import {
  useAppDispatch,
  useAppSelector,
  selectPendingRequests,
  selectIsProcessing,
  selectSigningError,
  fetchPendingRequests,
  approveRequest,
  rejectRequest,
  clearError,
} from '../../store';
import { SigningRequestCard, BiometricPrompt } from '../../components';
import { SigningRequest } from '../../types';

const SigningScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const requests = useAppSelector(selectPendingRequests);
  const isProcessing = useAppSelector(selectIsProcessing);
  const error = useAppSelector(selectSigningError);

  const [refreshing, setRefreshing] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SigningRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  // Handle deep link to specific request
  useEffect(() => {
    if (params.id && requests.length > 0) {
      const request = requests.find(r => r.id === params.id);
      if (request) {
        handleApprove(request.id);
      }
    }
  }, [params.id, requests]);

  const loadRequests = async () => {
    dispatch(fetchPendingRequests());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleApprove = useCallback((requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowBiometric(true);
    }
  }, [requests]);

  const handleBiometricSuccess = useCallback(async () => {
    setShowBiometric(false);
    
    if (!selectedRequest) return;

    const result = await dispatch(approveRequest(selectedRequest.id));
    
    if (approveRequest.fulfilled.match(result)) {
      setSnackbar({
        visible: true,
        message: 'Document signed successfully!',
        type: 'success',
      });
    } else {
      setSnackbar({
        visible: true,
        message: error || 'Failed to sign document',
        type: 'error',
      });
    }
    
    setSelectedRequest(null);
  }, [selectedRequest, dispatch, error]);

  const handleBiometricCancel = useCallback(() => {
    setShowBiometric(false);
    setSelectedRequest(null);
  }, []);

  const handleBiometricError = useCallback((errorMsg: string) => {
    setShowBiometric(false);
    setSelectedRequest(null);
    setSnackbar({
      visible: true,
      message: errorMsg,
      type: 'error',
    });
  }, []);

  const handleReject = useCallback((requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowRejectDialog(true);
    }
  }, [requests]);

  const confirmReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    const result = await dispatch(rejectRequest({
      requestId: selectedRequest.id,
      reason: rejectReason,
    }));
    
    setShowRejectDialog(false);
    setRejectReason('');
    setSelectedRequest(null);

    if (rejectRequest.fulfilled.match(result)) {
      setSnackbar({
        visible: true,
        message: 'Request rejected',
        type: 'success',
      });
    }
  };

  const handleViewDetails = useCallback((requestId: string) => {
    // Could navigate to detail screen
    Alert.alert('Request Details', `Request ID: ${requestId}`);
  }, []);

  const filteredRequests = requests.filter(r => {
    if (filter === 'urgent') return r.priority === 'urgent';
    if (filter === 'normal') return r.priority === 'normal';
    return true;
  });

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="check-circle" size={64} color="#27ae60" />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        All Caught Up!
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        No pending signing requests
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Signing Requests
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {requests.length} pending
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
        >
          All ({requests.length})
        </Chip>
        <Chip
          selected={filter === 'urgent'}
          onPress={() => setFilter('urgent')}
          style={styles.filterChip}
        >
          Urgent ({requests.filter(r => r.priority === 'urgent').length})
        </Chip>
        <Chip
          selected={filter === 'normal'}
          onPress={() => setFilter('normal')}
          style={styles.filterChip}
        >
          Normal ({requests.filter(r => r.priority === 'normal').length})
        </Chip>
      </View>

      {/* List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SigningRequestCard
            request={item}
            onApprove={handleApprove}
            onReject={handleReject}
            onPress={handleViewDetails}
            isProcessing={isProcessing && selectedRequest?.id === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Biometric Prompt */}
      <BiometricPrompt
        visible={showBiometric}
        onSuccess={handleBiometricSuccess}
        onCancel={handleBiometricCancel}
        onError={handleBiometricError}
        title="Sign Document"
        subtitle={selectedRequest ? `Sign ${selectedRequest.document_type.replace('_', ' ')} for ${selectedRequest.requester_name}` : undefined}
      />

      {/* Reject Dialog */}
      <Portal>
        <Dialog visible={showRejectDialog} onDismiss={() => setShowRejectDialog(false)}>
          <Dialog.Title>Reject Request</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Please provide a reason for rejecting this request:
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Enter reason..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={styles.reasonInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              onPress={confirmReject}
              disabled={!rejectReason.trim()}
              textColor="#e74c3c"
            >
              Reject
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
  headerTitle: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  headerSubtitle: {
    color: '#7f8c8d',
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#7f8c8d',
    marginTop: 4,
  },
  dialogText: {
    marginBottom: 16,
  },
  reasonInput: {
    backgroundColor: '#fff',
  },
  successSnackbar: {
    backgroundColor: '#27ae60',
  },
  errorSnackbar: {
    backgroundColor: '#e74c3c',
  },
});

export default SigningScreen;
