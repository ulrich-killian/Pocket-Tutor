import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/hooks/useChat';
import { useAuth } from '../../src/hooks/useAuth';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import AIThinking from '../../components/chat/AIThinking';
import type { ChatMessage } from '../../src/types/chat.types';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const documentId = params.documentId as string;
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const userId = user?.id;
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Get document title from params for header
  const documentTitle = (params.title as string) || 'Document';

  // Don't proceed if no user or document
  if (!userId || !documentId) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.surface}
        />
        <View style={styles.errorIconContainer}>
          <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
        </View>
        <Text style={styles.errorTitle}>
          {!userId ? 'Sign In Required' : 'No Document Selected'}
        </Text>
        <Text style={styles.errorText}>
          {!userId
            ? 'Please sign in to chat with your documents'
            : 'Select a document to start chatting'}
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { messages, send, loading, error } = useChat(userId, documentId);

  const handleSend = async (text: string): Promise<void> => {
    if (!text.trim()) return;
    await send(text);
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({
    item,
  }: ListRenderItemInfo<ChatMessage>): React.JSX.Element => (
    <ChatBubble message={item} />
  );

  const keyExtractor = (item: ChatMessage): string => item.id;

  // Check if this is a new chat (no messages yet)
  const isNewChat = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={16} color="#6366F1" />
            <Text style={styles.headerTitle}>AI Tutor</Text>
          </View>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {documentTitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            /* Add menu action */
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList<ChatMessage>
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.list, isNewChat && styles.listEmpty]}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#6366F1" />
            </View>
            <Text style={styles.emptyTitle}>Start Learning</Text>
            <Text style={styles.emptyText}>
              Ask me anything about your document. I can help you understand
              concepts, summarize content, or answer questions.
            </Text>
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              <View style={styles.suggestionsList}>
                <View style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>
                    Summarize this document
                  </Text>
                </View>
                <View style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>
                    Explain key concepts
                  </Text>
                </View>
                <View style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>
                    What are the main points?
                  </Text>
                </View>
              </View>
            </View>
          </View>
        }
      />

      {/* AI Thinking indicator */}
      {loading ? <AIThinking visible={true} /> : null}

      {/* Error message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color="#EF4444" />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => send('')}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={loading} />
    </KeyboardAvoidingView>
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 50 : 40,
      paddingBottom: 12,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: c.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    list: {
      paddingHorizontal: 8,
      paddingVertical: 16,
      flexGrow: 1,
    },
    listEmpty: {
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 40,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    suggestionsContainer: {
      width: '100%',
    },
    suggestionsTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textTertiary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    suggestionsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    suggestionChip: {
      backgroundColor: c.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    suggestionText: {
      fontSize: 13,
      color: '#4F46E5',
    },
    loadingContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    loadingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      alignSelf: 'flex-start',
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    loadingText: {
      fontSize: 13,
      color: c.textSecondary,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    errorBannerText: {
      flex: 1,
      fontSize: 13,
      color: '#DC2626',
    },
    retryText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#EF4444',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: c.background,
    },
    errorIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 15,
      color: c.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    errorButton: {
      backgroundColor: '#4F46E5',
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    errorButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
