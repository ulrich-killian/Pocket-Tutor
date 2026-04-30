import api from './api';
import type {
  SendMessagePayload,
  SendMessageResponse,
} from '../types/chat.types';

export const sendMessage = async (
  payload: SendMessagePayload,
  mode: 'strict' | 'free' = 'free',
): Promise<SendMessageResponse> => {
  const isFreeChat = !payload.documentId;
  const endpoint = isFreeChat ? '/chat/free' : '/chat/ask';

  const requestBody = {
    documentId: payload.documentId,
    userId: payload.userId,
    question: payload.message,
    image: payload.image,
    sessionId: payload.sessionId, // ← was missing
    history: isFreeChat ? (payload.history ?? []) : undefined, // ← was missing
  };

  const { data } = await api.post<SendMessageResponse>(endpoint, requestBody);

  return data;
};
