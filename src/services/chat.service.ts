import api from './api';
import type {
  SendMessagePayload,
  SendMessageResponse,
} from '../types/chat.types';

export const sendMessage = async (
  payload: SendMessagePayload,
): Promise<SendMessageResponse> => {
  // Call the /api/chat/ask endpoint with the correct payload structure
  const { data } = await api.post<SendMessageResponse>('/api/chat/ask', {
    documentId: payload.documentId,
    userId: payload.userId,
    question: payload.message,
  });
  return data;
};
