import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../src/context/ThemeContext';

export type ProcessingStep =
  | 'uploading'
  | 'extracting'
  | 'generating'
  | 'ready'
  | 'error';

interface ProcessingScreenProps {
  fileName: string;
  currentStep: ProcessingStep;
  onClose?: () => void;
  onComplete?: () => void;
  errorMessage?: string;
}

interface StepItem {
  id: ProcessingStep;
  label: string;
}

const STEPS: StepItem[] = [
  { id: 'uploading', label: 'File uploaded' },
  { id: 'extracting', label: 'Extracting text' },
  { id: 'generating', label: 'Generating AI index' },
  { id: 'ready', label: 'Ready to study' },
];

function getStepIndex(step: ProcessingStep): number {
  const index = STEPS.findIndex((s) => s.id === step);
  return index >= 0 ? index : 0;
}

function getStepStatus(
  stepIndex: number,
  currentStepIndex: number,
): 'completed' | 'active' | 'pending' {
  if (stepIndex < currentStepIndex) return 'completed';
  if (stepIndex === currentStepIndex) return 'active';
  return 'pending';
}

export default function ProcessingScreen({
  fileName,
  currentStep,
  onClose,
  onComplete,
  errorMessage,
}: ProcessingScreenProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentStepIndex = getStepIndex(currentStep);
  const isCompleted = currentStep === 'ready';
  const isError = currentStep === 'error';

  useEffect(() => {
    if (!isCompleted && !isError) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spin.start();
      return () => spin.stop();
    }
  }, [isCompleted, isError, spinAnim]);

  useEffect(() => {
    const targetProgress = (currentStepIndex + 1) / STEPS.length;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentStepIndex, progressAnim]);

  useEffect(() => {
    if (!isCompleted && !isError) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
  }, [isCompleted, isError, pulseAnim]);

  useEffect(() => {
    if (isCompleted && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onComplete]);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderStepIcon = (status: 'completed' | 'active' | 'pending') => {
    if (status === 'completed') {
      return (
        <View style={styles.stepIconCompleted}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      );
    }
    if (status === 'active') {
      return (
        <Animated.View
          style={[styles.stepIconActive, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.stepIconActiveInner}>
            <Ionicons
              name="hourglass-outline"
              size={14}
              color={colors.primary}
            />
          </View>
        </Animated.View>
      );
    }
    return <View style={styles.stepIconPending} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pocket Tutor</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.circularContainer}>
          <Animated.View
            style={[
              styles.circularProgress,
              !isCompleted &&
                !isError && { transform: [{ rotate: spinInterpolate }] },
            ]}
          >
            <View style={styles.circularInner}>
              <Ionicons
                name={
                  isError
                    ? 'alert-circle'
                    : isCompleted
                      ? 'checkmark-circle'
                      : 'document-text'
                }
                size={40}
                color={isError ? '#EF4444' : colors.primary}
              />
            </View>
          </Animated.View>
        </View>
        <Text style={styles.fileName} numberOfLines={2}>
          {fileName}
        </Text>
        <Text style={styles.statusText}>
          {isError
            ? 'Error processing document'
            : isCompleted
              ? 'Document ready!'
              : 'Processing your document...'}
        </Text>
        {isError && errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => {
            const status = getStepStatus(index, currentStepIndex);
            const isLast = index === STEPS.length - 1;
            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  {renderStepIcon(status)}
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        status === 'completed' && styles.stepLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    status === 'completed' && styles.stepLabelCompleted,
                    status === 'active' && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        {!isCompleted && !isError ? (
          <Text style={styles.footerText}>
            This usually takes less than 30 seconds.
          </Text>
        ) : null}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>
        {isCompleted ? (
          <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
            <Text style={styles.actionButtonText}>Start Studying</Text>
          </TouchableOpacity>
        ) : null}
        {isError ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={handleBack}
          >
            <Text style={styles.actionButtonText}>Try Again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.text,
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 40,
    },
    circularContainer: {
      marginBottom: 32,
    },
    circularProgress: {
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 4,
      borderColor: c.primary,
      borderTopColor: c.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circularInner: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fileName: {
      fontSize: 22,
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
      marginBottom: 8,
      maxWidth: 280,
    },
    statusText: {
      fontSize: 16,
      color: c.textSecondary,
      marginBottom: 40,
    },
    errorText: {
      fontSize: 14,
      color: '#EF4444',
      textAlign: 'center',
      marginTop: -24,
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    stepsContainer: {
      width: '100%',
      maxWidth: 280,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      minHeight: 50,
    },
    stepIndicator: {
      alignItems: 'center',
      marginRight: 16,
    },
    stepIconCompleted: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepIconActive: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#DBEAFE',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: -2,
    },
    stepIconActiveInner: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepIconPending: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.border,
    },
    stepLine: {
      width: 2,
      height: 26,
      backgroundColor: c.border,
      marginTop: 4,
    },
    stepLineCompleted: {
      backgroundColor: '#10B981',
    },
    stepLabel: {
      fontSize: 16,
      color: c.textTertiary,
      paddingTop: 2,
    },
    stepLabelCompleted: {
      color: c.text,
    },
    stepLabelActive: {
      color: c.text,
      fontWeight: '500',
    },
    footer: {
      paddingHorizontal: 32,
      paddingBottom: Platform.OS === 'ios' ? 50 : 32,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: c.textTertiary,
      marginBottom: 16,
    },
    progressBarContainer: {
      width: '60%',
      height: 4,
      backgroundColor: c.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: c.primary,
      borderRadius: 2,
    },
    actionButton: {
      marginTop: 24,
      backgroundColor: c.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    retryButton: {
      backgroundColor: '#EF4444',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
