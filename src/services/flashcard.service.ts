import api from './api';
import { Flashcard, GenerateFlashcardsRequest } from '../types/flashcard';

export const generateFlashcards = async (
  payload: GenerateFlashcardsRequest,
): Promise<Flashcard[]> => {
  const response = await api.post<Flashcard[]>('/flashcards/generate', payload);
  return response.data;
};

export const getFlashcardsByDocument = async (
  documentId: string,
): Promise<Flashcard[]> => {
  const response = await api.get<Flashcard[]>(`/flashcards/${documentId}`);
  return response.data;
};
