import React, { useEffect, useRef } from 'react';
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
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentStepIndex = getStepIndex(currentStep);
  const isCompleted = currentStep === 'ready';
  const isError = currentStep === 'error';

  // Spinning animation for the main icon
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

  // Progress bar animation
  useEffect(() => {
    const targetProgress = (currentStepIndex + 1) / STEPS.length;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentStepIndex, progressAnim]);

  // Pulse animation for active step
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

  // Auto navigate on complete
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

  const renderStepIcon = (
    status: 'completed' | 'active' | 'pending',
    isLast: boolean,
  ) => {
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
            <Ionicons name="hourglass-outline" size={14} color="#1E3A8A" />
          </View>
        </Animated.View>
      );
    }

    return <View style={styles.stepIconPending} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pocket Tutor</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Circular Progress */}
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
                color={isError ? '#EF4444' : '#1E3A8A'}
              />
            </View>
          </Animated.View>
        </View>
        {/* File Name */}
        <Text style={styles.fileName} numberOfLines={2}>
          {fileName}
        </Text>
        --------- {/* Status Text */} ---------
        <Text style={styles.statusText}>
          {isError
            ? 'Error processing document'
            : isCompleted
              ? 'Document ready!'
              : 'Processing your document...'}
        </Text>
        {/* Error Message */}
        {isError && errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => {
            const status = isError
              ? index < currentStepIndex
                ? 'completed'
                : index === currentStepIndex
                  ? 'active'
                  : 'pending'
              : getStepStatus(index, currentStepIndex);
            const isLast = index === STEPS.length - 1;

            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  {renderStepIcon(status, isLast)}
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

      {/* Footer */}
      <View style={styles.footer}>
        {!isCompleted && !isError && (
          <Text style={styles.footerText}>
            This usually takes less than 30 seconds.
          </Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>

        {/* Action Buttons */}
        {isCompleted && (
          <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
            <Text style={styles.actionButtonText}>Start Studying</Text>
          </TouchableOpacity>
        )}

        {isError && (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={handleBack}
          >
            <Text style={styles.actionButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
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
    borderColor: '#1E3A8A',
    borderTopColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 280,
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  stepLine: {
    width: 2,
    height: 26,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  stepLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    paddingTop: 2,
  },
  stepLabelCompleted: {
    color: '#1F2937',
  },
  stepLabelActive: {
    color: '#1F2937',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '60%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E3A8A',
    borderRadius: 2,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: '#1E3A8A',
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
