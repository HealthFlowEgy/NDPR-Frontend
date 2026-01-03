/**
 * HealthFlow Mobile App - Login Screen
 * 
 * OAuth 2.0 + PKCE authentication with Keycloak.
 * Branded with HealthFlow colors: Navy Blue (#1e3a5f) and Gold (#c9a227)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, login, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from '../../store';
import { BRAND_COLORS } from '../_layout';

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
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="headlineSmall" style={styles.subtitle}>
            Digital Healthcare Credentials
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${BRAND_COLORS.primary}15` }]}>
              <MaterialCommunityIcons name="wallet" size={24} color={BRAND_COLORS.primary} />
            </View>
            <Text variant="bodyMedium" style={styles.featureText}>
              Manage your digital credentials
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${BRAND_COLORS.secondary}25` }]}>
              <MaterialCommunityIcons name="draw" size={24} color={BRAND_COLORS.secondary} />
            </View>
            <Text variant="bodyMedium" style={styles.featureText}>
              Sign documents remotely
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${BRAND_COLORS.primary}15` }]}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color={BRAND_COLORS.primary} />
            </View>
            <Text variant="bodyMedium" style={styles.featureText}>
              Verify credentials instantly
            </Text>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={BRAND_COLORS.error} />
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
            buttonColor={BRAND_COLORS.primary}
            textColor="#ffffff"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Text variant="bodySmall" style={styles.helpText}>
            Sign in with your healthcare professional credentials
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialCommunityIcons name="shield-check" size={16} color={BRAND_COLORS.secondary} />
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
  logo: {
    width: 200,
    height: 120,
    marginBottom: 16,
  },
  subtitle: {
    color: BRAND_COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
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
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 12,
    color: BRAND_COLORS.text,
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
    color: BRAND_COLORS.error,
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
    color: BRAND_COLORS.textLight,
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
    color: BRAND_COLORS.textLight,
  },
});

export default LoginScreen;
