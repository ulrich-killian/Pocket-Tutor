import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/hooks/useChat';
import { useAuth } from '../../src/hooks/useAuth';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import type { ChatMessage } from '../../src/types/chat.types';

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get the document ID from navigation params
  const documentId = params.documentId as string;

  // Get the authenticated user from your auth hook
  const { user } = useAuth();
  const userId = user?.id;

  const listRef = useRef<FlatList<ChatMessage>>(null);

  console.log('🔍 ChatScreen - All params:', params);
  console.log('🔍 ChatScreen - documentId:', documentId);
  console.log('🔍 ChatScreen - userId:', userId);

  // Don't proceed if no user or document
  if (!userId || !documentId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>
          {!userId ? 'Please log in to continue' : 'No document selected'}
        </Text>
        <Text style={styles.errorText}>
          {!userId
            ? 'Sign in to access your documents'
            : 'Select a document from your library'}
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
    console.log(
      '📤 Sending message with userId:',
      userId,
      'documentId:',
      documentId,
    );
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Chat</Text>
          <Text style={styles.headerSubtitle}>Chat with your tutor</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <FlatList<ChatMessage>
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
      />

      {loading && (
        <View style={styles.typing}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.typingText}>Tutor is thinking...</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <ChatInput onSend={handleSend} disabled={loading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  typingText: { fontSize: 13, color: '#9CA3AF' },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 8,
    fontSize: 13,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
