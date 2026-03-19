import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthState } from '../src/hooks/useAuth';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const PROGRESS_WIDTH = width - 80;

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthState();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const loadingOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  // Animation sequence
  useEffect(() => {
    // 1. Logo fades in slowly (1500ms)
    logoOpacity.value = withTiming(1, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    });

    // 2. Title fades in after logo (1500ms more)
    titleOpacity.value = withDelay(
      1500,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
    );

    // 3. Subtitle fades in after title (1500ms more)
    subtitleOpacity.value = withDelay(
      3000,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
    );

    // 4. Loading shows after subtitle is done (5000ms total)
    loadingOpacity.value = withDelay(5000, withTiming(1, { duration: 500 }));

    // 5. Progress bar starts after loading appears
    progressWidth.value = withDelay(
      5500,
      withTiming(PROGRESS_WIDTH, { duration: 2500, easing: Easing.linear }),
    );
  }, []);

  // Navigate after progress completes
  useEffect(() => {
    if (initialized) {
      // Total: 5000 (fade in) + 500 (loading fade in) + 2500 (progress) = 8000ms
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/dashboard');
        } else {
          router.replace('/(auth)/login');
        }
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [initialized, isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>PT</Text>
        </View>
      </Animated.View>

      <Animated.View style={titleAnimatedStyle}>
        <Text style={styles.title}>Pocket Tutor</Text>
      </Animated.View>

      <Animated.View style={subtitleAnimatedStyle}>
        <Text style={styles.subtitle}>Your AI-Powered Learning Companion</Text>
      </Animated.View>

      <Animated.View style={[styles.loadingWrapper, loadingAnimatedStyle]}>
        <Text style={styles.loadingText}>Loading...</Text>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[styles.progressBarFill, progressAnimatedStyle]}
          />
        </View>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrapper: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#93C5FD',
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 23,
  },
  loadingWrapper: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#93C5FD',
    marginBottom: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    width: PROGRESS_WIDTH,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  version: {
    position: 'absolute',
    bottom: 45,
    fontSize: 13,
    color: '#60A5FA',
    fontWeight: '500',
  },
});
