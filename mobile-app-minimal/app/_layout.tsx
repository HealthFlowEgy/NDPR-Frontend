import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Simple initialization - just hide splash and mark ready
    const init = async () => {
      try {
        // Add a small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Simple navigation - always go to login if not in auth group
    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    if (!inAuthGroup && !inMainGroup) {
      // Navigate to login screen
      router.replace('/(auth)/login');
    }
  }, [isReady, segments]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logoText}>HealthFlow</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Slot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});
