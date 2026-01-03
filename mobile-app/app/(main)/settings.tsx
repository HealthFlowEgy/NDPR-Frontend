/**
 * HealthFlow Mobile App - Settings Screen
 * 
 * App settings and user profile management.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  Avatar,
  Button,
  Card,
  Portal,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  useAppDispatch,
  useAppSelector,
  selectUser,
  selectUserDID,
  logout,
} from '../../store';
import StorageService from '../../services/storage.service';
import SigningService from '../../services/signing.service';
import { config } from '../../config/environment';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userDID = useAppSelector(selectUserDID);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const capabilities = await SigningService.getBiometricCapabilities();
    setBiometricAvailable(capabilities.isAvailable && capabilities.isEnrolled);
    
    const enabled = await StorageService.isBiometricEnabled();
    setBiometricEnabled(enabled);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Verify biometric before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication',
      });
      
      if (result.success) {
        await StorageService.setBiometricEnabled(true);
        setBiometricEnabled(true);
      }
    } else {
      await StorageService.setBiometricEnabled(false);
      setBiometricEnabled(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logout());
    setShowLogoutDialog(false);
    router.replace('/(auth)/login');
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={64}
              label={(user?.given_name?.[0] || 'U').toUpperCase()}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={styles.profileName}>
                {user?.name || 'Healthcare Professional'}
              </Text>
              <Text variant="bodyMedium" style={styles.profileEmail}>
                {user?.email}
              </Text>
              {userDID && (
                <View style={styles.didBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#27ae60" />
                  <Text variant="bodySmall" style={styles.didBadgeText}>
                    DID Verified
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Security Section */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Security</List.Subheader>
          
          <List.Item
            title="Biometric Authentication"
            description={biometricAvailable ? "Use Face ID or fingerprint" : "Not available on this device"}
            left={(props) => <List.Icon {...props} icon="fingerprint" />}
            right={() => (
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={!biometricAvailable}
              />
            )}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Session Timeout"
            description="Auto-logout after 15 minutes of inactivity"
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            style={styles.listItem}
          />
        </List.Section>

        {/* Digital Identity Section */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Digital Identity</List.Subheader>
          
          <List.Item
            title="My DID"
            description={userDID ? userDID.id : "Not configured"}
            left={(props) => <List.Icon {...props} icon="account-key" />}
            right={(props) => userDID && <List.Icon {...props} icon="check-circle" color="#27ae60" />}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Signing History"
            description="View past document signatures"
            left={(props) => <List.Icon {...props} icon="history" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'This feature is under development.')}
            style={styles.listItem}
          />
        </List.Section>

        {/* App Info Section */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>App Info</List.Subheader>
          
          <List.Item
            title="Version"
            description={config.app.version}
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-lock-outline" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => openLink('https://healthflow.tech/privacy')}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => openLink('https://healthflow.tech/terms')}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Support"
            description="Get help with the app"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => openLink('mailto:support@healthflow.tech')}
            style={styles.listItem}
          />
        </List.Section>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={() => setShowLogoutDialog(true)}
            icon="logout"
            textColor="#e74c3c"
            style={styles.logoutButton}
          >
            Sign Out
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            HealthFlow Mobile v{config.app.version}
          </Text>
          <Text variant="bodySmall" style={styles.footerText}>
            © 2026 HealthFlow Group
          </Text>
        </View>
      </ScrollView>

      {/* Logout Dialog */}
      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to sign out? You will need to sign in again to access your credentials.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)} disabled={isLoggingOut}>
              Cancel
            </Button>
            <Button
              onPress={handleLogout}
              loading={isLoggingOut}
              disabled={isLoggingOut}
              textColor="#e74c3c"
            >
              Sign Out
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
  scrollContent: {
    paddingBottom: 32,
  },
  profileCard: {
    margin: 16,
    borderRadius: 12,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3498db',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  profileEmail: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  didBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  didBadgeText: {
    color: '#27ae60',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  listItem: {
    backgroundColor: '#fff',
    paddingVertical: 4,
  },
  logoutSection: {
    padding: 16,
    paddingTop: 24,
  },
  logoutButton: {
    borderColor: '#e74c3c',
    borderRadius: 12,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    gap: 4,
  },
  footerText: {
    color: '#95a5a6',
  },
});

export default SettingsScreen;
