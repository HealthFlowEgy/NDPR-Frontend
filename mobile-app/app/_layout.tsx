/**
 * HealthFlow Mobile App - Root Layout
 * 
 * Main app entry point with providers and initial setup.
 * Branded with HealthFlow colors: Navy Blue (#1e3a5f) and Gold (#c9a227)
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { store, useAppDispatch, useAppSelector, checkAuthStatus, selectIsAuthenticated, selectAuthLoading } from '../store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// HealthFlow Brand Colors
export const BRAND_COLORS = {
  primary: '#1e3a5f',      // Navy Blue
  secondary: '#c9a227',    // Gold
  primaryLight: '#2d5a8a', // Lighter Navy
  primaryDark: '#152a45',  // Darker Navy
  secondaryLight: '#d4b84a', // Lighter Gold
  secondaryDark: '#a88820', // Darker Gold
  success: '#27ae60',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  background: '#f5f6fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  border: '#bdc3c7',
};

// Custom theme with HealthFlow branding
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BRAND_COLORS.primary,
    secondary: BRAND_COLORS.secondary,
    tertiary: BRAND_COLORS.primaryLight,
    error: BRAND_COLORS.error,
    background: BRAND_COLORS.background,
    surface: BRAND_COLORS.surface,
    surfaceVariant: '#f8f9fa',
    onSurface: BRAND_COLORS.text,
    onSurfaceVariant: BRAND_COLORS.textLight,
    outline: BRAND_COLORS.border,
    primaryContainer: BRAND_COLORS.primaryLight,
    secondaryContainer: BRAND_COLORS.secondaryLight,
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
  },
  roundness: 12,
};

// Auth state observer component
function AuthObserver() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const [isReady, setIsReady] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      await dispatch(checkAuthStatus());
      setIsReady(true);
      await SplashScreen.hideAsync();
    };
    checkAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main if already authenticated
      router.replace('/(main)');
    }
  }, [isAuthenticated, segments, isReady, isLoading]);

  // Show loading while checking auth
  if (!isReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
      </View>
    );
  }

  return <Slot />;
}

// Main app layout
export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="light" backgroundColor={BRAND_COLORS.primary} />
          <AuthObserver />
        </PaperProvider>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.background,
  },
});
