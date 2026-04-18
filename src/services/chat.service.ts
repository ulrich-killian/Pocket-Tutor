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
  const requestBody = {
    documentId: payload.documentId,
    userId: payload.userId,
    question: payload.message,
    image: payload.image,
  };

  const { data } = await api.post<SendMessageResponse>(
    '/chat/ask',
    requestBody,
  );

  return data;
};
