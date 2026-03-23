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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/hooks/useChat';
import { useSessionStore } from '../../src/store/sessionStore';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import type { ChatMessage } from '../../src/types/chat.types';

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const { sessionId, initializeSession } = useSessionStore();

  // Initialize session on mount
  useEffect(() => {
    if (!sessionId) {
      initializeSession();
    }
  }, [sessionId, initializeSession]);

  // Use a default document ID (you may want to get this from a documents list)
  const documentId = 'default-doc';
  const { messages, send, loading, error } = useChat(sessionId, documentId);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = async (text: string): Promise<void> => {
    await send(text);
    listRef.current?.scrollToEnd({ animated: true });
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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>AI Chat</Text>
          <Text style={styles.headerSubtitle}>Chat with your tutor</Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
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

import { TouchableOpacity } from 'react-native';

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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: { fontSize: 13, color: '#9CA3AF' },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 8,
    fontSize: 13,
  },
});
