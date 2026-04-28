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

export const useChat = (userId: string, documentId?: string): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Trigger initial welcome message for new conversations
  useEffect(() => {
    if (!initialLoadDone.current && !documentId && messages.length === 0) {
      initialLoadDone.current = true;
      // Send empty greeting to trigger welcome message
      send('').catch(() => {});
    }
  }, [userId, documentId]);

  const send = useCallback(
    async (text: string, image?: string): Promise<void> => {
      // Allow empty text only for initial welcome (no messages yet)
      if (!text.trim() && messages.length > 0) return;

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
    [userId, documentId, messages],
  );

  const clearError = useCallback((): void => setError(null), []);
  const clearMessages = useCallback((): void => setMessages([]), []);

  return { messages, send, loading, error, clearError, clearMessages };
};
