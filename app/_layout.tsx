import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuthState } from '../src/context/AuthContext';

function RootLayoutNav() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthState();

  // Handle deep links
  useEffect(() => {
    const handleUrl = (url: string) => {
      // Check if the URL is for onboarding (from email confirmation)
      if (
        url.includes('/onboarding') ||
        url.includes('confirm-email') ||
        url.includes('auth/confirm')
      ) {
        if (isAuthenticated) {
          // User is logged in, go to onboarding
          router.replace('/(protected)/onboarding');
        }
      }
    };

    // Get initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // Listen for URL changes
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, [initialized, isAuthenticated]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
