/**
 * HealthFlow Mobile App - Root Layout
 * 
 * Main app entry point with providers and initial setup.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { store, useAppDispatch, useAppSelector, checkAuthStatus, selectIsAuthenticated, selectAuthLoading } from '../store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors if splash screen is already hidden
});

// Custom theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3498db',
    secondary: '#27ae60',
    tertiary: '#9b59b6',
    error: '#e74c3c',
    background: '#f5f6fa',
    surface: '#ffffff',
    surfaceVariant: '#f8f9fa',
    onSurface: '#2c3e50',
    onSurfaceVariant: '#7f8c8d',
    outline: '#bdc3c7',
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
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(checkAuthStatus());
      } catch (e: any) {
        console.warn('Auth check failed:', e);
        setError(e.message || 'Failed to check authentication');
      } finally {
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch {
          // Ignore errors if splash screen is already hidden
        }
      }
    };
    checkAuth();
  }, [dispatch]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main if already authenticated
      router.replace('/(main)');
    }
  }, [isAuthenticated, segments, isReady, isLoading, router]);

  // Show loading while checking auth
  if (!isReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading HealthFlow...</Text>
      </View>
    );
  }

  // Show error if auth check failed
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
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
          <StatusBar style="dark" />
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
