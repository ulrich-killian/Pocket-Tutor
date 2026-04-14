import { useState, useCallback } from 'react';
import { sendMessage } from '../services/chat.service';
import type { ChatMessage } from '../types/chat.types';
import { randomUUID } from 'expo-crypto';

interface UseChatReturn {
  messages: ChatMessage[];
  send: (text: string, image?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useChat = (userId: string, documentId?: string): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string, image?: string): Promise<void> => {
      if (!text.trim()) return;

      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
        image: image,
      };

      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
      setLoading(true);
      setError(null);

      try {
        console.log(
          '📨 Sending message with userId:',
          userId,
          'documentId:',
          documentId,
          'hasImage:',
          !!image,
        );

        const response = await sendMessage({
          message: text,
          documentId: documentId,
          userId: userId,
          image: image,
        });

        const aiMessage: ChatMessage = {
          id: randomUUID(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          modelUsed: response.modelUsed,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [userId, documentId, messages],
  );

  const clearError = useCallback((): void => setError(null), []);

  return { messages, send, loading, error, clearError };
};
