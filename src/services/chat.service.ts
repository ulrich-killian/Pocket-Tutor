import api from './api';
import type {
  SendMessagePayload,
  SendMessageResponse,
} from '../types/chat.types';

export const sendMessage = async (
  payload: SendMessagePayload,
): Promise<SendMessageResponse> => {
  const { data } = await api.post<SendMessageResponse>('/chat/ask', {
    documentId: payload.documentId,
    userId: payload.userId,
    question: payload.message,
  });

  return data;
};
