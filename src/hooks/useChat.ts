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
}

export const useChat = (
  userId: string,
  documentId?: string, // Made optional to support Free Chat
): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      // 1. Update local state immediately for UI responsiveness
      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
      setLoading(true);
      setError(null);

      try {
        // 2. Prepare the history for the AI (excluding the latest message we just added)
        // We map our ChatMessage type to the expected {role, content} format
        const chatHistory = messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // 3. Call service with Hybrid Logic
        // If we have a documentId, we can use 'strict' or 'free' mode.
        // Using 'free' mode here allows the AI to be more conversational.
        const response = await sendMessage(
          {
            message: text,
            documentId: documentId,
            userId: userId,
            history: chatHistory, // Now the AI has memory!
          },
          documentId ? 'strict' : 'free',
        );

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
    [userId, documentId, messages], // Added messages to dependencies so history stays updated
  );

  const clearError = useCallback((): void => setError(null), []);

  return { messages, send, loading, error, clearError };
};
