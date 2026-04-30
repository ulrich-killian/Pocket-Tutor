import { useState, useCallback, useEffect, useRef } from 'react';
import { sendMessage } from '../services/chat.service';
import type { ChatMessage } from '../types/chat.types';
import { randomUUID } from 'expo-crypto';

interface UseChatReturn {
  messages: ChatMessage[];
  send: (text: string, image?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  clearMessages: () => void;
}

export const useChat = (
  userId: string,
  documentId?: string,
  sessionId?: string,
  initialMessages: ChatMessage[] = [],
): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages.length]);

  useEffect(() => {
    if (!initialLoadDone.current && !documentId && messages.length === 0) {
      initialLoadDone.current = true;
      send('hello').catch(() => {});
    }
  }, [userId, documentId]);

  const send = useCallback(
    async (text: string, image?: string): Promise<void> => {
      if (!text.trim() && messages.length > 0) return;

      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
        image,
      };

      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
      setLoading(true);
      setError(null);

      // Build history from current messages (exclude the one just added)
      const history = messages
        .filter((m) => m.content?.trim()) // skip empty greeting message
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      try {
        const response = await sendMessage({
          message: text,
          documentId,
          userId,
          image,
          sessionId, // ← PASS sessionId
          history, // ← PASS history
        });

        if (!response || typeof response.answer !== 'string') {
          throw new Error('Invalid response from server');
        }

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
    [userId, documentId, sessionId, messages],
  );

  const clearError = useCallback((): void => setError(null), []);
  const clearMessages = useCallback((): void => setMessages([]), []);

  return { messages, send, loading, error, clearError, clearMessages };
};
