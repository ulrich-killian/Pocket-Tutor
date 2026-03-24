import { create } from 'zustand';
import { randomUUID } from 'expo-crypto';

interface SessionState {
  sessionId: string;
  setSessionId: (id: string) => void;
  initializeSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: '',
  setSessionId: (id: string) => set({ sessionId: id }),
  initializeSession: () => set({ sessionId: randomUUID() }),
}));
