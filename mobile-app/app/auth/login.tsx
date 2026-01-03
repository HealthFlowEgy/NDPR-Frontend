/**
 * HealthFlow Mobile App - Login Screen
 * 
 * OAuth 2.0 + PKCE authentication with Keycloak.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, login, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from '../../store';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(main)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    dispatch(clearError());
    const result = await dispatch(login());
    
    if (login.fulfilled.match(result)) {
      router.replace('/(main)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.content}>
        {/* Logo and branding */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="hospital-building" size={64} color="#3498db" />
          </View>
          <Text variant="displaySmall" style={styles.title}>
            HealthFlow
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Digital Healthcare Credentials
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="wallet" size={24} color="#27ae60" />
            <Text variant="bodyMedium" style={styles.featureText}>
              Manage your digital credentials
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="draw" size={24} color="#9b59b6" />
            <Text variant="bodyMedium" style={styles.featureText}>
              Sign documents remotely
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#e67e22" />
            <Text variant="bodyMedium" style={styles.featureText}>
              Verify credentials instantly
            </Text>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#e74c3c" />
            <Text variant="bodyMedium" style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* Login button */}
        <View style={styles.loginSection}>
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            buttonColor="#3498db"
          >
            {isLoading ? 'Signing in...' : 'Sign In with Keycloak'}
          </Button>
          
          <Text variant="bodySmall" style={styles.helpText}>
            Sign in with your healthcare professional credentials
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialCommunityIcons name="shield-check" size={16} color="#95a5a6" />
          <Text variant="bodySmall" style={styles.footerText}>
            Secured by Egyptian e-signature standards
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ebf5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  subtitle: {
    color: '#7f8c8d',
    marginTop: 4,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 12,
    color: '#2c3e50',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdeaea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  helpText: {
    color: '#95a5a6',
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    gap: 6,
  },
  footerText: {
    color: '#95a5a6',
  },
});

export default LoginScreen;
