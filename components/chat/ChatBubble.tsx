import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ChatMessage } from '../../src/types/chat.types';
import SourceList from './SourceList';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
        {message.content}
      </Text>
      {!isUser && message.sources && message.sources.length > 0 && (
        <SourceList sources={message.sources} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
  },
  text: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  aiText: { color: '#111827' },
});

export default ChatBubble;
