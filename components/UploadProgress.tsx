import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../src/context/ThemeContext';

interface UploadProgressProps {
  progress: number; // 0 to 100
  fileName: string;
  isVisible: boolean;
  onComplete?: () => void;
}

export default function UploadProgress({
  progress,
  fileName,
  isVisible,
  onComplete,
}: UploadProgressProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim]);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (progress >= 100 && onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [progress, animatedWidth, onComplete]);

  if (!isVisible) return null;

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.fileInfo}>
          <Ionicons name="cloud-upload" size={20} color="#3B82F6" />
          <Text
            style={styles.fileName}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {fileName}
          </Text>
        </View>
        <Text style={styles.percentage}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[styles.progressBar, { width: widthInterpolate }]}
        />
      </View>

      <Text style={styles.statusText}>
        {progress < 100 ? 'Uploading...' : 'Upload complete!'}
      </Text>
    </Animated.View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginVertical: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    fileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
      gap: 8,
    },
    fileName: {
      fontSize: 14,
      fontWeight: '500',
      color: c.text,
      flex: 1,
    },
    percentage: {
      fontSize: 14,
      fontWeight: '600',
      color: '#3B82F6',
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: c.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#3B82F6',
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
    },
  });
