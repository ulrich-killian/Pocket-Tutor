import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { generateQuiz, submitQuiz } from '../../src/services/quiz.service';
import type {
  QuizQuestion,
  SubmitQuizResponse,
  SubmitQuizAnswer,
} from '../../src/types/quiz.type';

const { width } = Dimensions.get('window');

const BLOOM_LABELS: Record<string, string> = {
  L1: 'Remember',
  L2: 'Understand',
  L3: 'Apply',
  L4: 'Analyze',
  L5: 'Evaluate',
  L6: 'Create',
};

const BLOOM_COLORS: Record<string, string> = {
  L1: '#10B981',
  L2: '#3B82F6',
  L3: '#8B5CF6',
  L4: '#F59E0B',
  L5: '#EF4444',
  L6: '#EC4899',
};

type QuizPhase = 'setup' | 'loading' | 'active' | 'review' | 'results';

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const documentId = params.documentId as string;
  const { user } = useAuth();

  const [phase, setPhase] = useState<QuizPhase>(documentId ? 'setup' : 'setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [results, setResults] = useState<SubmitQuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(5);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleGenerateQuiz = async () => {
    if (!user?.id || !documentId) return;
    setPhase('loading');
    setError(null);
    try {
      const response = await generateQuiz({
        documentId,
        userId: user.id,
        questionCount,
      });
      setQuestions(response.questions);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setPhase('active');
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
      setPhase('setup');
    }
  };

  const handleSelectOption = (option: string) => {
    if (phase === 'review') return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      animateTransition(() => setCurrentIndex((i) => i + 1));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      animateTransition(() => setCurrentIndex((i) => i - 1));
    }
  };

  const handleSubmit = async () => {
    setPhase('loading');
    try {
      const answers: SubmitQuizAnswer[] = questions.map((q) => ({
        questionId: q.id,
        answer: selectedAnswers[q.id] || '',
        correctAnswer: q.correctAnswer,
        bloomLevel: q.bloomLevel,
        explanation: q.explanation,
      }));
      const response = await submitQuiz({ answers });
      setResults(response);
      setPhase('results');
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
      setPhase('active');
    }
  };

  const handleReviewAnswers = () => {
    setCurrentIndex(0);
    setPhase('review');
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setResults(null);
    setPhase('active');
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const allAnswered = answeredCount === totalQuestions;

  // ─── No Document Selected ──────────────────────────────────────
  if (!documentId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="document-text-outline" size={56} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>No Document Selected</Text>
          <Text style={styles.emptySubtitle}>
            Select a document from your library to generate a quiz
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(protected)/documents' as any)}
          >
            <Ionicons name="folder-open" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Browse Documents</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Loading ────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingTitle}>Generating Your Quiz</Text>
            <Text style={styles.loadingSubtitle}>
              AI is crafting questions from your document...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ─── Setup Phase ───────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={styles.headerButton} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.setupContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card */}
          <View style={styles.setupHero}>
            <View style={styles.setupHeroIcon}>
              <Ionicons name="school" size={40} color="#1E3A8A" />
            </View>
            <Text style={styles.setupHeroTitle}>Test Your Knowledge</Text>
            <Text style={styles.setupHeroSubtitle}>
              Generate an AI-powered quiz based on your uploaded document
            </Text>
          </View>

          {/* Question Count */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="help-circle" size={22} color="#1E3A8A" />
              <Text style={styles.settingTitle}>Number of Questions</Text>
            </View>
            <View style={styles.countSelector}>
              {[3, 5, 10].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countOption,
                    questionCount === count && styles.countOptionActive,
                  ]}
                  onPress={() => setQuestionCount(count)}
                >
                  <Text
                    style={[
                      styles.countOptionText,
                      questionCount === count && styles.countOptionTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoRow}>
            <View style={[styles.infoCard, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="bulb" size={24} color="#4F46E5" />
              <Text style={styles.infoCardTitle}>Bloom's Taxonomy</Text>
              <Text style={styles.infoCardDesc}>
                Questions span 6 cognitive levels
              </Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="analytics" size={24} color="#10B981" />
              <Text style={styles.infoCardTitle}>Smart Scoring</Text>
              <Text style={styles.infoCardDesc}>
                Detailed breakdown by skill
              </Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateQuiz}
          >
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── Results Phase ────────────────────────────────────────
  if (phase === 'results' && results) {
    const percentage = results.percentage;
    const grade =
      percentage >= 90
        ? 'A+'
        : percentage >= 80
          ? 'A'
          : percentage >= 70
            ? 'B'
            : percentage >= 60
              ? 'C'
              : percentage >= 50
                ? 'D'
                : 'F';
    const gradeColor =
      percentage >= 80 ? '#10B981' : percentage >= 60 ? '#F59E0B' : '#EF4444';

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={styles.headerButton} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Score Card */}
          <View style={styles.scoreCard}>
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
              <Text style={styles.gradeText}>{grade}</Text>
            </View>
            <Text style={styles.scorePercentage}>
              {Math.round(percentage)}%
            </Text>
            <Text style={styles.scoreLabel}>
              {results.score} of {results.total} correct
            </Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${percentage}%`, backgroundColor: gradeColor },
                ]}
              />
            </View>
          </View>

          {/* Bloom's Breakdown */}
          <View style={styles.bloomCard}>
            <Text style={styles.bloomCardTitle}>
              Bloom's Taxonomy Breakdown
            </Text>
            {Object.entries(results.bloomBreakdown).map(([level, data]) => {
              const pct =
                data.total > 0 ? (data.correct / data.total) * 100 : 0;
              const color = BLOOM_COLORS[level] || '#6B7280';
              return (
                <View key={level} style={styles.bloomRow}>
                  <View style={styles.bloomLabelRow}>
                    <View
                      style={[styles.bloomDot, { backgroundColor: color }]}
                    />
                    <Text style={styles.bloomLabel}>
                      {level} · {BLOOM_LABELS[level] || level}
                    </Text>
                    <Text style={styles.bloomScore}>
                      {data.correct}/{data.total}
                    </Text>
                  </View>
                  <View style={styles.bloomBar}>
                    <View
                      style={[
                        styles.bloomBarFill,
                        { width: `${pct}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={handleReviewAnswers}
            >
              <Ionicons name="eye" size={20} color="#1E3A8A" />
              <Text style={styles.reviewButtonText}>Review Answers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry Quiz</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Active / Review Phase ────────────────────────────────
  const isReview = phase === 'review';
  const selectedOption = selectedAnswers[currentQuestion?.id];
  const resultForCurrent = results?.results.find(
    (r) => r.questionId === currentQuestion?.id,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{isReview ? 'Review' : 'Quiz'}</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentIndex + 1} of {totalQuestions}
          </Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Bloom Level Badge */}
          <View style={styles.bloomBadgeRow}>
            <View
              style={[
                styles.bloomBadge,
                {
                  backgroundColor:
                    (BLOOM_COLORS[currentQuestion?.bloomLevel] || '#6B7280') +
                    '20',
                },
              ]}
            >
              <View
                style={[
                  styles.bloomBadgeDot,
                  {
                    backgroundColor:
                      BLOOM_COLORS[currentQuestion?.bloomLevel] || '#6B7280',
                  },
                ]}
              />
              <Text
                style={[
                  styles.bloomBadgeText,
                  {
                    color:
                      BLOOM_COLORS[currentQuestion?.bloomLevel] || '#6B7280',
                  },
                ]}
              >
                {BLOOM_LABELS[currentQuestion?.bloomLevel] ||
                  currentQuestion?.bloomLevel}
              </Text>
            </View>
            <Text style={styles.questionCounter}>
              {answeredCount}/{totalQuestions} answered
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion?.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect =
                isReview && option === currentQuestion.correctAnswer;
              const isWrong = isReview && isSelected && !isCorrect;
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && !isReview && styles.optionSelected,
                    isCorrect && styles.optionCorrect,
                    isWrong && styles.optionWrong,
                  ]}
                  onPress={() => handleSelectOption(option)}
                  activeOpacity={isReview ? 1 : 0.7}
                  disabled={isReview}
                >
                  <View
                    style={[
                      styles.optionLetter,
                      isSelected && !isReview && styles.optionLetterSelected,
                      isCorrect && styles.optionLetterCorrect,
                      isWrong && styles.optionLetterWrong,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLetterText,
                        (isSelected || isCorrect || isWrong) &&
                          styles.optionLetterTextActive,
                      ]}
                    >
                      {optionLetter}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && !isReview && styles.optionTextSelected,
                      isCorrect && styles.optionTextCorrect,
                      isWrong && styles.optionTextWrong,
                    ]}
                  >
                    {option}
                  </Text>
                  {isCorrect && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#10B981"
                    />
                  )}
                  {isWrong && (
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation (Review Mode) */}
          {isReview && resultForCurrent && (
            <View style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Ionicons name="bulb" size={20} color="#F59E0B" />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>
                {currentQuestion?.explanation}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentIndex === 0 ? '#D1D5DB' : '#1E3A8A'}
          />
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {/* Question Dots */}
        <View style={styles.dotsContainer}>
          {questions.map((q, i) => (
            <TouchableOpacity
              key={q.id}
              onPress={() => animateTransition(() => setCurrentIndex(i))}
            >
              <View
                style={[
                  styles.dot,
                  i === currentIndex && styles.dotActive,
                  selectedAnswers[q.id] &&
                    i !== currentIndex &&
                    styles.dotAnswered,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {currentIndex === totalQuestions - 1 && !isReview ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !allAnswered && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!allAnswered}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : isReview && currentIndex === totalQuestions - 1 ? (
          <TouchableOpacity
            style={styles.navButtonRight}
            onPress={() => setPhase('results')}
          >
            <Text style={styles.navButtonRightText}>Results</Text>
            <Ionicons name="trophy" size={20} color="#1E3A8A" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButtonRight} onPress={handleNext}>
            <Text style={styles.navButtonRightText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#1E3A8A" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },

  // ── Header ──────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // ── Progress ────────────────────────
  progressContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1E3A8A',
    borderRadius: 2,
  },

  // ── Empty State ─────────────────────
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  // ── Buttons ─────────────────────────
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Loading ─────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  // ── Setup Phase ─────────────────────
  setupContent: {
    padding: 20,
    paddingBottom: 40,
  },
  setupHero: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  setupHeroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  setupHeroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  setupHeroSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  countSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  countOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  countOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1E3A8A',
  },
  countOptionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  countOptionTextActive: {
    color: '#1E3A8A',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  infoCardDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  // ── Quiz Active ─────────────────────
  quizContent: {
    padding: 20,
    paddingBottom: 20,
  },
  bloomBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bloomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  bloomBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bloomBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  questionCounter: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  optionSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EEF2FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterSelected: {
    backgroundColor: '#1E3A8A',
  },
  optionLetterCorrect: {
    backgroundColor: '#10B981',
  },
  optionLetterWrong: {
    backgroundColor: '#EF4444',
  },
  optionLetterText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  optionLetterTextActive: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#991B1B',
    fontWeight: '600',
  },

  // ── Explanation ─────────────────────
  explanationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  explanationText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 22,
  },

  // ── Bottom Bar ──────────────────────
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  navButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  navButtonRightText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
  },
  dotAnswered: {
    backgroundColor: '#93C5FD',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Results ─────────────────────────
  resultsContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  gradeBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scorePercentage: {
    fontSize: 44,
    fontWeight: '800',
    color: '#1F2937',
  },
  scoreLabel: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: 8,
    borderRadius: 4,
  },

  // ── Bloom Breakdown ─────────────────
  bloomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bloomCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 18,
  },
  bloomRow: {
    marginBottom: 14,
  },
  bloomLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bloomDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  bloomLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  bloomScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  bloomBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bloomBarFill: {
    height: 6,
    borderRadius: 3,
  },

  // ── Result Actions ──────────────────
  resultActions: {
    gap: 12,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    gap: 10,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
