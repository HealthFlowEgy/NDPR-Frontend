/**
 * HealthFlow Mobile App - Dashboard Screen
 * 
 * Main home screen showing overview of credentials and signing requests.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useAppDispatch,
  useAppSelector,
  selectUser,
  selectPendingRequests,
  selectSigningStats,
  selectCredentials,
  fetchPendingRequests,
  fetchSigningStats,
} from '../../store';

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const pendingRequests = useAppSelector(selectPendingRequests);
  const stats = useAppSelector(selectSigningStats);
  const credentials = useAppSelector(selectCredentials);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(fetchPendingRequests());
    dispatch(fetchSigningStats());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const urgentCount = pendingRequests.filter(r => r.priority === 'urgent').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="bodyMedium" style={styles.greeting}>
              Welcome back,
            </Text>
            <Text variant="headlineSmall" style={styles.name}>
              {user?.given_name || user?.name || 'Doctor'}
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={(user?.given_name?.[0] || 'D').toUpperCase()}
            style={styles.avatar}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {pendingRequests.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending Requests
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, urgentCount > 0 && styles.urgentCard]}>
            <Card.Content style={styles.statContent}>
              <Text
                variant="headlineMedium"
                style={[styles.statValue, urgentCount > 0 && styles.urgentValue]}
              >
                {urgentCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Urgent
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats?.total_signed || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Signed
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Pending Requests
              </Text>
              <Button
                mode="text"
                compact
                onPress={() => router.push('/(main)/signing')}
              >
                View All
              </Button>
            </View>

            {pendingRequests.slice(0, 3).map((request) => (
              <Card
                key={request.id}
                style={[
                  styles.requestCard,
                  request.priority === 'urgent' && styles.urgentRequestCard,
                ]}
                onPress={() => router.push(`/(main)/signing?id=${request.id}`)}
              >
                <Card.Content style={styles.requestContent}>
                  <View style={styles.requestInfo}>
                    <Text variant="titleSmall" style={styles.requestType}>
                      {request.document_type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text variant="bodySmall" style={styles.requestRequester}>
                      {request.requester_name}
                    </Text>
                    {request.patient_name && (
                      <Text variant="bodySmall" style={styles.requestPatient}>
                        Patient: {request.patient_name}
                      </Text>
                    )}
                  </View>
                  {request.priority === 'urgent' && (
                    <Chip
                      mode="flat"
                      style={styles.urgentChip}
                      textStyle={styles.urgentChipText}
                    >
                      URGENT
                    </Chip>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            <Card style={styles.actionCard} onPress={() => router.push('/(main)/wallet')}>
              <Card.Content style={styles.actionContent}>
                <MaterialCommunityIcons name="wallet" size={32} color="#3498db" />
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Wallet
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard} onPress={() => router.push('/(main)/signing')}>
              <Card.Content style={styles.actionContent}>
                <MaterialCommunityIcons name="draw" size={32} color="#27ae60" />
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Sign
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard} onPress={() => router.push('/(main)/scanner')}>
              <Card.Content style={styles.actionContent}>
                <MaterialCommunityIcons name="qrcode-scan" size={32} color="#9b59b6" />
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Scan
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard} onPress={() => router.push('/(main)/settings')}>
              <Card.Content style={styles.actionContent}>
                <MaterialCommunityIcons name="cog" size={32} color="#e67e22" />
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Settings
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* My Credentials */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              My Credentials
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => router.push('/(main)/wallet')}
            >
              View All
            </Button>
          </View>

          {credentials.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="card-account-details-outline" size={48} color="#bdc3c7" />
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No credentials yet
                </Text>
              </Card.Content>
            </Card>
          ) : (
            credentials.slice(0, 2).map((cred, index) => (
              <Card
                key={cred.id || index}
                style={styles.credentialCard}
                onPress={() => router.push('/(main)/wallet')}
              >
                <Card.Content style={styles.credentialContent}>
                  <MaterialCommunityIcons
                    name="certificate"
                    size={24}
                    color="#3498db"
                  />
                  <View style={styles.credentialInfo}>
                    <Text variant="titleSmall">
                      {cred.credentialSubject.professionalType}
                    </Text>
                    <Text variant="bodySmall" style={styles.credentialSubtext}>
                      {cred.credentialSubject.syndicateNumber}
                    </Text>
                  </View>
                  <Chip mode="flat" style={styles.activeChip}>
                    Active
                  </Chip>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#7f8c8d',
  },
  name: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  avatar: {
    backgroundColor: '#3498db',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  urgentCard: {
    backgroundColor: '#fdeaea',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  urgentValue: {
    color: '#e74c3c',
  },
  statLabel: {
    color: '#7f8c8d',
    marginTop: 4,
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
  requestCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  urgentRequestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  requestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  requestRequester: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  requestPatient: {
    color: '#95a5a6',
    marginTop: 2,
  },
  urgentChip: {
    backgroundColor: '#e74c3c',
  },
  urgentChipText: {
    color: '#fff',
    fontSize: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    borderRadius: 12,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionLabel: {
    marginTop: 8,
    color: '#2c3e50',
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#95a5a6',
    marginTop: 8,
  },
  credentialCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  credentialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  credentialInfo: {
    flex: 1,
  },
  credentialSubtext: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  activeChip: {
    backgroundColor: '#d5f4e6',
  },
});

export default DashboardScreen;
