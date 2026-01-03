/**
 * HealthFlow Mobile App - Dashboard Screen
 * 
 * Main home screen showing overview of credentials and signing requests.
 * Branded with HealthFlow colors: Navy Blue (#1e3a5f) and Gold (#c9a227)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { Text, Card, Button, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../_layout';
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
      {/* Header with gradient background */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
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
            labelStyle={{ color: BRAND_COLORS.primary }}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={BRAND_COLORS.primary}
            colors={[BRAND_COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: `${BRAND_COLORS.primary}15` }]}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color={BRAND_COLORS.primary} />
              </View>
              <Text variant="headlineMedium" style={styles.statValue}>
                {pendingRequests.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, urgentCount > 0 && styles.urgentCard]}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: urgentCount > 0 ? '#fdeaea' : `${BRAND_COLORS.secondary}20` }]}>
                <MaterialCommunityIcons name="alert-circle" size={20} color={urgentCount > 0 ? BRAND_COLORS.error : BRAND_COLORS.secondary} />
              </View>
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
              <View style={[styles.statIcon, { backgroundColor: `${BRAND_COLORS.success}15` }]}>
                <MaterialCommunityIcons name="check-circle" size={20} color={BRAND_COLORS.success} />
              </View>
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
                textColor={BRAND_COLORS.primary}
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
                <View style={[styles.actionIcon, { backgroundColor: `${BRAND_COLORS.primary}15` }]}>
                  <MaterialCommunityIcons name="wallet" size={28} color={BRAND_COLORS.primary} />
                </View>
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Wallet
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard} onPress={() => router.push('/(main)/signing')}>
              <Card.Content style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: `${BRAND_COLORS.secondary}20` }]}>
                  <MaterialCommunityIcons name="draw" size={28} color={BRAND_COLORS.secondary} />
                </View>
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Sign
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard} onPress={() => router.push('/(main)/scanner')}>
              <Card.Content style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: `${BRAND_COLORS.primary}15` }]}>
                  <MaterialCommunityIcons name="qrcode-scan" size={28} color={BRAND_COLORS.primary} />
                </View>
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Scan
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard} onPress={() => router.push('/(main)/settings')}>
              <Card.Content style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: `${BRAND_COLORS.secondary}20` }]}>
                  <MaterialCommunityIcons name="cog" size={28} color={BRAND_COLORS.secondary} />
                </View>
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
              textColor={BRAND_COLORS.primary}
            >
              View All
            </Button>
          </View>

          {credentials.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="card-account-details-outline" size={48} color={BRAND_COLORS.border} />
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
                  <View style={[styles.credentialIcon, { backgroundColor: `${BRAND_COLORS.primary}15` }]}>
                    <MaterialCommunityIcons
                      name="certificate"
                      size={24}
                      color={BRAND_COLORS.primary}
                    />
                  </View>
                  <View style={styles.credentialInfo}>
                    <Text variant="titleSmall">
                      {cred.credentialSubject.professionalType}
                    </Text>
                    <Text variant="bodySmall" style={styles.credentialSubtext}>
                      {cred.credentialSubject.syndicateNumber}
                    </Text>
                  </View>
                  <Chip mode="flat" style={styles.activeChip} textStyle={{ color: BRAND_COLORS.success }}>
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
    backgroundColor: BRAND_COLORS.background,
  },
  headerContainer: {
    backgroundColor: BRAND_COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
  },
  name: {
    fontWeight: '700',
    color: '#ffffff',
  },
  avatar: {
    backgroundColor: BRAND_COLORS.secondary,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    marginTop: -40,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 2,
  },
  urgentCard: {
    backgroundColor: '#fff',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: '700',
    color: BRAND_COLORS.text,
  },
  urgentValue: {
    color: BRAND_COLORS.error,
  },
  statLabel: {
    color: BRAND_COLORS.textLight,
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
    color: BRAND_COLORS.text,
  },
  requestCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  urgentRequestCard: {
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLORS.error,
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
    color: BRAND_COLORS.text,
  },
  requestRequester: {
    color: BRAND_COLORS.textLight,
    marginTop: 2,
  },
  requestPatient: {
    color: BRAND_COLORS.textLight,
    marginTop: 2,
  },
  urgentChip: {
    backgroundColor: BRAND_COLORS.error,
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
    borderRadius: 16,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    marginTop: 12,
    color: BRAND_COLORS.text,
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: BRAND_COLORS.textLight,
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
  credentialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  credentialInfo: {
    flex: 1,
  },
  credentialSubtext: {
    color: BRAND_COLORS.textLight,
    marginTop: 2,
  },
  activeChip: {
    backgroundColor: `${BRAND_COLORS.success}20`,
  },
});

export default DashboardScreen;
