export type MessageRole = 'user' | 'assistant';

export interface Source {
  chunkIndex: number;
  preview: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[]; // Updated to use the Source interface
  timestamp: Date;
  modelUsed?: string; // Good for debugging the "Real Tech"
}

export interface SendMessagePayload {
  message: string;
  documentId: string;
  userId: string;
}

export interface SendMessageResponse {
  answer: string; // Matches backend 'answer'
  question: string;
  modelUsed: string;
  sourcesUsed: number;
  sources: Source[]; // Matches the backend array of objects
}
