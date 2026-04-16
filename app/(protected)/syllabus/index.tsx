import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/hooks/useAuth';
import { useSyllabus } from '../../../src/hooks/useSyllabus';
import { EducationLevelCard } from '../../../src/components/syllabus/EducationLevelCard';
import { StreamCard } from '../../../src/components/syllabus/StreamCard';
import { EducationLevel, Stream } from '../../../src/types/syllabus';
import syllabusService from '../../../src/services/syllabus.service';

export default function SyllabusScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const {
    levels,
    selectedLevel,
    selectedStream,
    isLoading,
    error,
    selectLevel,
    selectStream,
    fetchStreams,
  } = useSyllabus();

  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLevelSelect = useCallback(
    async (level: EducationLevel) => {
      selectLevel(level);
      if (level.streams && level.streams.length > 0) {
        setStreams(level.streams);
      } else {
        setStreamsLoading(true);
        try {
          const fetchedStreams = await fetchStreams(level.id);
          setStreams(fetchedStreams);
        } catch (err) {
          console.error('Failed to fetch streams:', err);
        } finally {
          setStreamsLoading(false);
        }
      }
    },
    [selectLevel, fetchStreams],
  );

  const handleStreamSelect = useCallback(
    async (stream: Stream) => {
      selectStream(stream);
      setIsSaving(true);

      // Save syllabus selection to user's profile
      if (user?.id && selectedLevel) {
        try {
          await syllabusService.selectSyllabus(
            user.id,
            selectedLevel.id,
            stream.id,
          );
        } catch (err) {
          console.error('Failed to save syllabus selection:', err);
        }
      }

      // Navigate to chat
      router.replace('/chat');
    },
    [selectStream, router, user, selectedLevel],
  );

  const handleBack = useCallback(() => {
    if (selectedLevel) {
      selectLevel(null);
      setStreams([]);
    } else {
      router.back();
    }
  }, [selectedLevel, selectLevel, router]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isSaving) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.savingText, { color: colors.text }]}>
          Saving your selection...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {selectedLevel ? 'Select Stream' : 'Syllabus'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!selectedLevel ? (
          <View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Select your level of education according to Cameroon Bloom
              Taxonomy
            </Text>
            {levels.map((level) => (
              <EducationLevelCard
                key={level.id}
                level={level}
                onPress={handleLevelSelect}
              />
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.selectedLevelHeader}>
              <Text style={[styles.selectedLevelName, { color: colors.text }]}>
                {selectedLevel.name}
              </Text>
              {selectedLevel.description && (
                <Text
                  style={[
                    styles.selectedLevelDesc,
                    { color: colors.textSecondary },
                  ]}
                >
                  {selectedLevel.description}
                </Text>
              )}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available Streams
            </Text>

            {streamsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              streams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onPress={handleStreamSelect}
                  isSelected={selectedStream?.id === stream.id}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  selectedLevelHeader: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  selectedLevelName: {
    fontSize: 20,
    fontWeight: '700',
  },
  selectedLevelDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  savingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});
