import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

interface AIThinkingProps {
  visible: boolean;
}

const AIThinking: React.FC<AIThinkingProps> = React.memo(({ visible }) => {
  if (!visible) return null;

  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (
      anim: Animated.Value,
      delay: number,
    ): (() => void) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    };

    const stop1 = createDotAnimation(dot1, 0);
    const stop2 = createDotAnimation(dot2, 200);
    const stop3 = createDotAnimation(dot3, 400);

    return () => {
      stop1();
      stop2();
      stop3();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      {/* AI Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>AI</Text>
      </View>

      {/* Thinking Bubble */}
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                transform: [
                  {
                    scale: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                transform: [
                  {
                    scale: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.thinkingText}>Thinking</Text>
      </View>
    </View>
  );
});

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#6366F1',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    bubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#6366F1',
    },
    thinkingText: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '500',
    },
  });

export default AIThinking;
