import api from './api';
import type {
  SendMessagePayload,
  SendMessageResponse,
} from '../types/chat.types';

/**
 * Sends a message to the Pocket Tutor backend.
 * * @param mode - 'strict' for document-only Q&A, 'free' for general tutor conversation.
 */
export const sendMessage = async (
  payload: SendMessagePayload,
  mode: 'strict' | 'free' = 'free',
): Promise<SendMessageResponse> => {
  const endpoint = !payload.documentId ? '/chat/free' : '/chat/ask';

  // Note: 'free' endpoint accepts 'history' and 'documentId' is optional
  const { data } = await api.post<SendMessageResponse>(endpoint, {
    userId: payload.userId,
    question: payload.message,
    documentId: payload.documentId, // Optional in 'free', required in 'strict'
    history: payload.history, // Only used in 'free' mode
  });

  return data;
};
