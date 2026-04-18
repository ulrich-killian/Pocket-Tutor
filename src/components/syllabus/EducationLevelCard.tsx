import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EducationLevel } from '../../types/syllabus';
import { useAppTheme, type AppColors } from '../../context/ThemeContext';

interface EducationLevelCardProps {
  level: EducationLevel;
  onPress: (level: EducationLevel) => void;
  isSelected?: boolean;
}

export function EducationLevelCard({
  level,
  onPress,
  isSelected,
}: EducationLevelCardProps) {
  const { colors } = useAppTheme();

  const getLevelIcon = (slug: string): keyof typeof Ionicons.glyphMap => {
    switch (slug) {
      case 'nursery':
        return 'happy-outline';
      case 'primary':
        return 'school-outline';
      case 'lower-secondary':
        return 'book-outline';
      case 'upper-secondary':
        return 'library-outline';
      case 'high-school':
        return 'school';
      default:
        return 'book-outline';
    }
  };

  const getLevelColor = (order: number): string => {
    const levelColors = ['#EC4899', '#4F46E5', '#10B981', '#F59E0B', '#8B5CF6'];
    return levelColors[(order - 1) % levelColors.length];
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        isSelected && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={() => onPress(level)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getLevelColor(level.order) + '20' },
        ]}
      >
        <Ionicons
          name={getLevelIcon(level.slug)}
          size={28}
          color={getLevelColor(level.order)}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{level.name}</Text>
        {level.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {level.description}
          </Text>
        )}
        {level.streams && level.streams.length > 0 && (
          <Text style={[styles.streamCount, { color: colors.textTertiary }]}>
            {level.streams.length} stream{level.streams.length !== 1 ? 's' : ''}{' '}
            available
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
    width: 52,
    height: 52,
    borderRadius: 14,
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
  streamCount: {
    fontSize: 12,
    marginTop: 4,
  },
});
