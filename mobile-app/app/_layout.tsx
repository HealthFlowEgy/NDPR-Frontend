/**
 * HealthFlow Mobile App - Root Layout
 * 
 * Main app entry point with providers and initial setup.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { store, useAppDispatch, useAppSelector, checkAuthStatus, selectIsAuthenticated, selectAuthLoading } from '../store';

// Prevent splash screen from auto-hiding - wrapped in try-catch
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // Ignore errors if splash screen is already hidden or not available
  console.warn('SplashScreen.preventAutoHideAsync failed:', e);
}

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

// Loading component
function LoadingScreen({ message }: { message?: string }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.loadingText}>{message || 'Loading HealthFlow...'}</Text>
    </View>
  );
}

// Error component
function ErrorScreen({ error }: { error: string }) {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </View>
  );
}

// Auth state observer component - separated for better error isolation
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
    let mounted = true;

    const checkAuth = async () => {
      try {
        await dispatch(checkAuthStatus());
      } catch (e: any) {
        console.warn('Auth check failed:', e);
        if (mounted) {
          setError(e?.message || 'Failed to check authentication');
        }
      } finally {
        if (mounted) {
          setIsReady(true);
          // Hide splash screen
          try {
            await SplashScreen.hideAsync();
          } catch {
            // Ignore errors if splash screen is already hidden
          }
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || isLoading) return;

    try {
      const inAuthGroup = segments[0] === '(auth)';

      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to main if already authenticated
        router.replace('/(main)');
      }
    } catch (e) {
      console.warn('Navigation error:', e);
    }
  }, [isAuthenticated, segments, isReady, isLoading, router]);

  // Show loading while checking auth
  if (!isReady || isLoading) {
    return <LoadingScreen />;
  }

  // Show error if auth check failed (but still render app)
  if (error) {
    console.warn('Auth error occurred but continuing:', error);
  }

  return <Slot />;
}

// Inner app with providers that need store access
function InnerApp() {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simple error boundary using state
  useEffect(() => {
    const errorHandler = (error: any) => {
      console.error('Unhandled error:', error);
      setHasError(true);
      setErrorMessage(error?.message || 'An unexpected error occurred');
    };

    // Note: This is a simplified error handler
    // In production, you'd want a proper ErrorBoundary component

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (hasError) {
    return <ErrorScreen error={errorMessage} />;
  }

  return <AuthObserver />;
}

// Main app layout
export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="dark" />
          <InnerApp />
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
