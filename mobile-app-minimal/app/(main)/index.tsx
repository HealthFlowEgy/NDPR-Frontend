import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome to HealthFlow</Text>
        <Text style={styles.subtitle}>Your Digital Healthcare Credentials</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📜 Credentials</Text>
          <Text style={styles.cardText}>View and manage your digital credentials</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✍️ Remote Signing</Text>
          <Text style={styles.cardText}>Sign documents remotely with your credentials</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 QR Scanner</Text>
          <Text style={styles.cardText}>Scan QR codes to verify credentials</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});
