import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProcessingBannerProps {
  count: number;
  isVisible: boolean;
}

export default function ProcessingBanner({
  count,
  isVisible,
}: ProcessingBannerProps) {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  useEffect(() => {
    if (isVisible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [isVisible, pulseAnim]);

  if (!isVisible && count === 0) return null;

  const message =
    count === 1
      ? '1 document is being processed...'
      : `${count} documents are being processed...`;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      <Animated.View style={[styles.iconContainer, { opacity: pulseAnim }]}>
        <Ionicons name="sync" size={18} color="#FFFFFF" />
      </Animated.View>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
