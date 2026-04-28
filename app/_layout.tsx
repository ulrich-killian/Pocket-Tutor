import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuthState } from '../src/context/AuthContext';
import { AppThemeProvider, useAppTheme } from '../src/context/ThemeContext';
import { authService } from '../src/services/authService';

function RootLayoutNav() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthState();

  // Handle deep links for email confirmation
  useEffect(() => {
    const handleUrl = async (url: string) => {
      // Parse the URL
      const parsedUrl = Linking.parse(url);

      // Check for email confirmation paths
      const path = parsedUrl.path || '';
      const queryParams = parsedUrl.queryParams || {};

      // Handle various confirmation URL patterns
      if (
        path.includes('onboarding') ||
        path.includes('confirm') ||
        path.includes('auth/confirm') ||
        queryParams.token_hash ||
        queryParams.confirmation_token
      ) {
        try {
          // If there's a token hash, verify it
          const tokenHash =
            (queryParams.token_hash as string) ||
            (queryParams.confirmation_token as string);

          if (tokenHash) {
            // Verify the email with the token
            await authService.verifyEmail(tokenHash);

            // After verification, route to onboarding (no auth required)
            router.replace('/(onboarding)/onboarding');
            return;
          }

          // If no token but path is confirmation, just go to onboarding
          router.replace('/(onboarding)/onboarding');
        } catch (error) {
          console.log('Email confirmation error:', error);
          // If verification fails, still try to navigate to onboarding
          router.replace('/(onboarding)/onboarding');
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

  const { isDark } = useAppTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutNav />
    </AppThemeProvider>
  );
}
