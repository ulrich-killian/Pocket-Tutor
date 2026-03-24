import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface AppLoaderProps {
  message?: string;
  visible?: boolean;
}

export default function AppLoader({
  message = 'Welcome back!',
  visible = true,
}: AppLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulsing logo animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    // Rotating ring animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    rotateAnimation.start();

    // Animated dots - using setInterval
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 4);
    }, 400);
    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      clearInterval(interval);
    };
  }, [pulseAnim, rotateAnim, fadeAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getDots = () => '.'.repeat(dotIndex);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Animated outer ring */}
        <Animated.View
          style={[styles.outerRing, { transform: [{ rotate }] }]}
        />

        {/* Pulsing inner circle */}
        <Animated.View
          style={[styles.innerCircle, { transform: [{ scale: pulseAnim }] }]}
        >
          {/* Logo/Icon placeholder */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>PT</Text>
          </View>
        </Animated.View>

        {/* Loading message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            {message}
            <Text style={styles.dots}>{getDots()}</Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  transform: [
                    {
                      scaleX: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderTopColor: '#6366f1',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  messageContainer: {
    marginTop: 30,
  },
  messageText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  dots: {
    color: '#6366f1',
  },
  progressContainer: {
    marginTop: 20,
    width: 150,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
});
