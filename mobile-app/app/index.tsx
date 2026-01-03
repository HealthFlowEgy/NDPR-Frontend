/**
 * HealthFlow Mobile App - Index Route
 * 
 * Initial route that shows loading while auth state is determined.
 * The actual navigation is handled by AuthObserver in _layout.tsx.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function Index() {
  // This screen is shown briefly while the auth observer determines
  // where to navigate. It will be replaced by either login or main.
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.text}>Starting HealthFlow...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
});
