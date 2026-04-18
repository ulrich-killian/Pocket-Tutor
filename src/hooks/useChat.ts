import { useState, useCallback } from 'react';
import { sendMessage } from '../services/chat.service';
import type { ChatMessage } from '../types/chat.types';
import { randomUUID } from 'expo-crypto';

interface UseChatReturn {
  messages: ChatMessage[];
  send: (text: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  clearMessages: () => void;
}

export const useChat = (
  userId: string, // Changed from sessionId to userId
  documentId: string, // Changed to required since you're passing it
): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string): Promise<void> => {
      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        console.log(
          '📨 Sending message with userId:',
          userId,
          'documentId:',
          documentId,
        );

        const response = await sendMessage({
          message: text,
          documentId: documentId,
          userId: userId, // Use the userId passed to the hook
        });

        if (!response || typeof response.answer !== 'string') {
          throw new Error('Invalid response from server');
        }

        const aiMessage: ChatMessage = {
          id: randomUUID(),
          role: 'assistant',
          content: response.answer,
          sources: Array.isArray(response.sources) ? response.sources : [],
          modelUsed:
            typeof response.modelUsed === 'string'
              ? response.modelUsed
              : undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        console.error('Chat error:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [userId, documentId], // Updated dependencies
  );

  const clearError = useCallback((): void => setError(null), []);
  const clearMessages = useCallback((): void => setMessages([]), []);

  return { messages, send, loading, error, clearError, clearMessages };
};
