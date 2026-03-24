import { useState, useCallback } from 'react';
import { sendMessage } from '../services/chat.service';
import type { ChatMessage } from '../types/chat.types';
import { randomUUID } from 'expo-crypto';
import { supabase } from '../lib/supabase';

interface UseChatReturn {
  messages: ChatMessage[];
  send: (text: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useChat = (
  sessionId: string,
  documentId?: string,
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
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const response = await sendMessage({
          message: text,
          sessionId,
          documentId: documentId || '',
          userId: user.id,
        });

        const aiMessage: ChatMessage = {
          id: randomUUID(),
          role: 'assistant',
          content: response.reply,
          sources: response.sources,
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
    [sessionId, documentId],
  );

  const clearError = useCallback((): void => setError(null), []);

  return { messages, send, loading, error, clearError };
};
