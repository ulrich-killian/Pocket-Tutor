export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: string[];
  timestamp: Date;
}

export interface SendMessagePayload {
  message: string;
  sessionId: string;
  documentId: string;
  userId: string;
}

export interface SendMessageResponse {
  reply: string;
  sources: string[];
  question?: string;
  modelUsed?: string;
  sourcesUsed?: number;
}
