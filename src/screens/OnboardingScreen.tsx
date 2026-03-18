import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

export default function OnboardingScreen({
  navigation,
}: OnboardingScreenProps) {
  const router = useRouter();

  // State for all selections
  const [category, setCategory] = useState<string>('');
  const [categoryOther, setCategoryOther] = useState('');
  const [showCategoryOther, setShowCategoryOther] = useState(false);

  const [topic, setTopic] = useState<string>('');
  const [topicOther, setTopicOther] = useState('');
  const [showTopicOther, setShowTopicOther] = useState(false);

  const [studyHours, setStudyHours] = useState<string>('');

  const [learningStyle, setLearningStyle] = useState<string>('');

  // Category options
  const categoryOptions = ['OL', 'A/L', 'HND', 'BSc', 'Others'];

  // Topic options
  const topicOptions = [
    'Science',
    'Art',
    'Technology',
    'Engineering',
    'Others',
  ];

  // Study hours options
  const studyHoursOptions = [
    { label: 'Under 1hr', value: 'under_1hr' },
    { label: '1-2hrs', value: '1_2hrs' },
    { label: '3+hrs', value: '3_plus_hrs' },
  ];

  // Learning style options
  const learningStyleOptions = [
    { label: 'I pick up quickly', value: 'quick' },
    { label: 'I need things repeated', value: 'repeated' },
    { label: 'I need examples to understand', value: 'examples' },
  ];

  const handleCategorySelect = (option: string) => {
    if (option === 'Others') {
      setShowCategoryOther(true);
      setCategory('Others');
    } else {
      setShowCategoryOther(false);
      setCategory(option);
      setCategoryOther('');
    }
  };

  const handleTopicSelect = (option: string) => {
    if (option === 'Others') {
      setShowTopicOther(true);
      setTopic('Others');
    } else {
      setShowTopicOther(false);
      setTopic(option);
      setTopicOther('');
    }
  };

  const handleContinue = () => {
    // Save onboarding data (you can integrate with your backend later)
    console.log('Onboarding data:', {
      category: category === 'Others' ? categoryOther : category,
      topic: topic === 'Others' ? topicOther : topic,
      studyHours,
      learningStyle,
    });

    // Navigate to dashboard
    router.replace('/dashboard');
  };

  const isFormComplete = category && topic && studyHours && learningStyle;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>PT</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>Questions</Text>
        <Text style={styles.headerSubtitle}>
          Help us personalize your learning experience
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.optionsGrid}>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  category === option && styles.optionButtonSelected,
                ]}
                onPress={() => handleCategorySelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {showCategoryOther && (
            <TextInput
              style={styles.otherInput}
              placeholder="Enter your category"
              placeholderTextColor="#9CA3AF"
              value={categoryOther}
              onChangeText={setCategoryOther}
            />
          )}
        </View>

        {/* Topic Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topic Interested In</Text>
          <View style={styles.optionsGrid}>
            {topicOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  topic === option && styles.optionButtonSelected,
                ]}
                onPress={() => handleTopicSelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    topic === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {showTopicOther && (
            <TextInput
              style={styles.otherInput}
              placeholder="Enter your topic"
              placeholderTextColor="#9CA3AF"
              value={topicOther}
              onChangeText={setTopicOther}
            />
          )}
        </View>

        {/* Study Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Hours</Text>
          <View style={styles.studyHoursContainer}>
            {studyHoursOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.studyHourButton,
                  studyHours === option.value && styles.studyHourButtonSelected,
                ]}
                onPress={() => setStudyHours(option.value)}
              >
                <View style={styles.radioOuter}>
                  {studyHours === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.studyHourText,
                    studyHours === option.value && styles.studyHourTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Learning Style Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Do You Learn?</Text>
          <View style={styles.learningStyleContainer}>
            {learningStyleOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.learningStyleButton,
                  learningStyle === option.value &&
                    styles.learningStyleButtonSelected,
                ]}
                onPress={() => setLearningStyle(option.value)}
              >
                <View style={styles.checkboxOuter}>
                  {learningStyle === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.learningStyleText,
                    learningStyle === option.value &&
                      styles.learningStyleTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormComplete && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isFormComplete}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#1E3A8A',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#93C5FD',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#1E3A8A',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  otherInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  studyHoursContainer: {
    gap: 12,
  },
  studyHourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  studyHourButtonSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E3A8A',
  },
  studyHourText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  studyHourTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  learningStyleContainer: {
    gap: 12,
  },
  learningStyleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  learningStyleButtonSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkmark: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  learningStyleText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
    lineHeight: 22,
  },
  learningStyleTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
