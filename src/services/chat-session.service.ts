import api from './api';

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  educationLevel?: string;
  stream?: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const chatSessionService = {
  createSession: async (
    userId: string,
    title: string,
    subject?: string,
    educationLevel?: string,
    stream?: string,
  ): Promise<ChatSession> => {
    const response = await api.post('/chat-sessions', {
      userId,
      title,
      subject,
      educationLevel,
      stream,
    });
    return response.data.session;
  },

  getUserSessions: async (userId: string): Promise<ChatSession[]> => {
    const response = await api.get(`/chat-sessions/user/${userId}`);
    return response.data.sessions;
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await api.get(`/chat-sessions/${sessionId}`);
    return response.data.session;
  },

  addMessage: async (sessionId: string, role: string, content: string): Promise<void> => {
    await api.post(`/chat-sessions/${sessionId}/messages`, { role, content });
  },

  updateSession: async (sessionId: string, lastMessage: string, messageCount: number): Promise<void> => {
    await api.patch(`/chat-sessions/${sessionId}`, { lastMessage, messageCount });
  },

  deleteSession: async (sessionId: string, userId: string): Promise<boolean> => {
    const response = await api.delete(`/chat-sessions/${sessionId}`, {
      data: { userId },
    });
    return response.data.success;
  },
};

export default chatSessionService;