import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuthState } from '../../src/hooks/useAuth';

export default function ProtectedLayout() {
  const { isAuthenticated, initialized } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after initialization is complete
    if (initialized && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [initialized, isAuthenticated]);

  // Show nothing while initializing or redirecting
  if (!initialized || !isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="flashcards" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="privacy-security" />
    </Stack>
  );
}
