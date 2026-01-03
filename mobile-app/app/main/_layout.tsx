/**
 * HealthFlow Mobile App - Main Layout
 * 
 * Bottom tab navigation for authenticated users.
 * Branded with HealthFlow colors: Navy Blue (#1e3a5f) and Gold (#c9a227)
 */

import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector, selectIsAuthenticated, fetchPendingRequests, selectPendingCount } from '../../store';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../_layout';

export default function MainLayout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const pendingCount = useAppSelector(selectPendingCount);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  // Fetch pending requests for badge
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPendingRequests());
    }
  }, [isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLORS.primary,
        tabBarInactiveTintColor: BRAND_COLORS.textLight,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: BRAND_COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="signing"
        options={{
          title: 'Sign',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="draw" size={size} color={color} />
          ),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: BRAND_COLORS.secondary,
            fontSize: 10,
            color: '#fff',
          },
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
