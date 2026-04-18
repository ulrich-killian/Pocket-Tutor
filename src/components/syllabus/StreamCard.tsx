import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stream } from '../../types/syllabus';
import { useAppTheme } from '../../context/ThemeContext';

interface StreamCardProps {
  stream: Stream;
  onPress: (stream: Stream) => void;
  isSelected?: boolean;
}

export function StreamCard({ stream, onPress, isSelected }: StreamCardProps) {
  const { colors } = useAppTheme();

  const getStreamIcon = (slug: string): keyof typeof Ionicons.glyphMap => {
    switch (slug) {
      case 'science':
        return 'flask-outline';
      case 'arts':
        return 'color-palette-outline';
      case 'commercial':
        return 'calculator-outline';
      case 'technical':
        return 'construct-outline';
      case 'general':
        return 'library-outline';
      default:
        return 'folder-outline';
    }
  };

  const getStreamColor = (slug: string): string => {
    switch (slug) {
      case 'science':
        return '#4F46E5';
      case 'arts':
        return '#EC4899';
      case 'commercial':
        return '#10B981';
      case 'technical':
        return '#F59E0B';
      case 'general':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        isSelected && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={() => onPress(stream)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getStreamColor(stream.slug) + '20' },
        ]}
      >
        <Ionicons
          name={getStreamIcon(stream.slug)}
          size={24}
          color={getStreamColor(stream.slug)}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {stream.name}
        </Text>
        {stream.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {stream.description}
          </Text>
        )}
        {stream.subjects && stream.subjects.length > 0 && (
          <Text style={[styles.subjectCount, { color: colors.textTertiary }]}>
            {stream.subjects.length} subject
            {stream.subjects.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isSelected ? colors.primary : colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
  subjectCount: {
    fontSize: 12,
    marginTop: 4,
  },
});
