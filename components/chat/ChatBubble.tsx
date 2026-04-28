import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import type { ChatMessage } from '../../src/types/chat.types';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

interface ParsedSegment {
  text: string;
  type: 'main' | 'sub' | 'key' | 'tip' | 'focus' | 'regular';
}

function parseContent(content: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      segments.push({ text: '\n', type: 'regular' });
      continue;
    }

    if (trimmed.startsWith('🌟') || trimmed.startsWith('**')) {
      const text = trimmed
        .replace(/^🌟\s*/, '')
        .replace(/\*\*/g, '')
        .trim();
      segments.push({ text: text + '\n', type: 'main' });
    } else if (
      trimmed.startsWith('•') ||
      trimmed.startsWith('→') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('`')
    ) {
      const text = trimmed
        .replace(/^[•→\-]\s*/, '')
        .replace(/^`/, '')
        .replace(/`$/, '')
        .trim();
      segments.push({ text: text + '\n', type: 'sub' });
    } else if (trimmed.startsWith('📚')) {
      const text = trimmed.replace(/^📚\s*/g, '').trim();
      segments.push({ text: text + '\n', type: 'key' });
    } else if (trimmed.startsWith('💡')) {
      const text = trimmed.replace(/^💡\s*/g, '').trim();
      segments.push({ text: text + '\n', type: 'tip' });
    } else if (trimmed.startsWith('🎯')) {
      const text = trimmed.replace(/^🎯\s*/g, '').trim();
      segments.push({ text: text + '\n', type: 'focus' });
    } else {
      segments.push({ text: trimmed + '\n', type: 'regular' });
    }
  }

  return segments;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

const { width: screenWidth } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = screenWidth * 0.75;

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {/* Avatar for AI messages */}
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>PT</Text>
        </View>
      )}

      <View
        style={[
          styles.bubbleWrapper,
          isUser ? styles.userBubbleWrapper : styles.assistantBubbleWrapper,
        ]}
      >
        {/* Role indicator */}
        <Text
          style={[
            styles.roleLabel,
            isUser ? styles.userRoleLabel : styles.assistantRoleLabel,
          ]}
        >
          {isUser ? 'You' : 'Tutor'}
        </Text>

        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {message.image && (
            <Image source={{ uri: message.image }} style={styles.image} />
          )}
          {!isUser ? (
            <View style={styles.contentContainer}>
              {parseContent(message.content).map((segment, index) => (
                <Text
                  key={index}
                  style={[
                    styles.text,
                    styles.assistantText,
                    segment.type === 'main' && styles.mainTopic,
                    segment.type === 'sub' && styles.subTopic,
                    segment.type === 'key' && styles.keyConcept,
                    segment.type === 'tip' && styles.tipText,
                    segment.type === 'focus' && styles.focusText,
                  ]}
                >
                  {segment.type === 'main' && '🌟 '}
                  {segment.type === 'sub' && '• '}
                  {segment.type === 'key' && '📚 '}
                  {segment.type === 'tip' && '💡 '}
                  {segment.type === 'focus' && '🎯 '}
                  {segment.text}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.text, styles.userText]}>
              {message.content}
            </Text>
          )}
        </View>

        {/* Model used indicator for AI */}
        {!isUser && message.modelUsed && (
          <View style={styles.modelBadge}>
            <Text style={styles.modelBadgeText}>{message.modelUsed}</Text>
          </View>
        )}

        {/* Sources section */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <View style={styles.sourcesContainer}>
            <View style={styles.sourcesHeader}>
              <View style={styles.sourceDot} />
              <Text style={styles.sourcesTitle}>Sources</Text>
            </View>
            {message.sources.slice(0, 2).map((source, index) => (
              <View key={index} style={styles.sourceItem}>
                <Text style={styles.sourcePreview} numberOfLines={1}>
                  {source.preview}
                </Text>
              </View>
            ))}
            {message.sources.length > 2 && (
              <Text style={styles.moreSources}>
                +{message.sources.length - 2} more
              </Text>
            )}
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'flex-end',
    },
    userContainer: {
      justifyContent: 'flex-end',
    },
    assistantContainer: {
      justifyContent: 'flex-start',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#6366F1',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    bubbleWrapper: {
      maxWidth: MAX_BUBBLE_WIDTH,
    },
    userBubbleWrapper: {
      alignItems: 'flex-end',
    },
    assistantBubbleWrapper: {
      alignItems: 'flex-start',
    },
    roleLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    userRoleLabel: {
      color: '#A5B4FC',
    },
    assistantRoleLabel: {
      color: '#6366F1',
    },
    bubble: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    userBubble: {
      backgroundColor: '#4F46E5',
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      backgroundColor: c.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
    text: {
      fontSize: 15,
      lineHeight: 22,
    },
    image: {
      width: '100%',
      height: 150,
      borderRadius: 12,
      marginBottom: 8,
    },
    userText: {
      color: '#FFFFFF',
    },
    assistantText: {
      color: c.text,
    },
    modelBadge: {
      alignSelf: 'flex-start',
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: c.borderLight,
      borderRadius: 4,
    },
    modelBadgeText: {
      fontSize: 9,
      color: c.textSecondary,
      fontWeight: '500',
    },
    sourcesContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: c.surfaceSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.divider,
    },
    sourcesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    sourceDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#6366F1',
      marginRight: 6,
    },
    sourcesTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sourceItem: {
      marginTop: 4,
    },
    sourcePreview: {
      fontSize: 12,
      color: c.textSecondary,
      lineHeight: 18,
    },
    moreSources: {
      fontSize: 11,
      color: '#6366F1',
      marginTop: 4,
      fontWeight: '500',
    },
    timestamp: {
      fontSize: 10,
      color: c.textTertiary,
      marginTop: 6,
      textAlign: 'right',
    },
    contentContainer: {
      flexWrap: 0,
    },
    mainTopic: {
      color: '#8B5CF6',
      fontWeight: '700',
      fontSize: 16,
      marginTop: 8,
      marginBottom: 2,
    },
    subTopic: {
      color: '#6B7280',
      fontSize: 14,
      marginLeft: 12,
      marginBottom: 2,
    },
    keyConcept: {
      color: '#059669',
      fontWeight: '600',
      fontSize: 14,
      marginTop: 6,
      marginBottom: 2,
    },
    tipText: {
      color: '#D97706',
      fontWeight: '500',
      fontSize: 14,
      marginTop: 6,
      fontStyle: 'italic',
    },
    focusText: {
      color: '#DC2626',
      fontWeight: '700',
      fontSize: 14,
      marginTop: 6,
      marginBottom: 2,
    },
  });
