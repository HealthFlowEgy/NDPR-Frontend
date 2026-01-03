/**
 * HealthFlow Mobile App - Index Route
 * 
 * Initial route that redirects based on auth state.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // This will be handled by the auth observer in _layout.tsx
  // Default redirect to auth/login, the observer will redirect to main if authenticated
  return <Redirect href="/(auth)/login" />;
}
