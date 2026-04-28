export type MessageRole = 'user' | 'assistant';

export interface Source {
  chunkIndex: number;
  preview: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  timestamp: Date;
  modelUsed?: string;
  image?: string;
}

export interface SendMessagePayload {
  history: any;
  message: string;
  documentId?: string;
  userId: string;
  image?: string;
}

export interface SendMessageResponse {
  answer: string; // Matches backend 'answer'
  question: string;
  modelUsed: string;
  sourcesUsed: number;
  sources: Source[]; // Matches the backend array of objects
}
