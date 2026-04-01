// services/flashcard.service.ts

import api from './api';
import type {
  Flashcard,
  GenerateFlashcardsPayload,
  GenerateFlashcardsResponse,
  GetFlashcardsResponse,
} from '../types/flashcard.type';

/**
 * Generate flashcards from a document using AI.
 *
 * @example
 * const flashcards = await generateFlashcards({
 *   documentId: 'cc2b20ff-...',
 *   userId: 'db677394-...',
 * });
 */
export async function generateFlashcards(
  payload: GenerateFlashcardsPayload,
): Promise<Flashcard[]> {
  const response = await api.post<GenerateFlashcardsResponse>(
    '/flashcards/generate',
    {
      documentId: payload.documentId,
      userId: payload.userId,
    },
  );
  return response.data.flashcards;
}

/**
 * Get flashcards for a specific document.
 *
 * @example
 * const flashcards = await getFlashcardsByDocument('cc2b20ff-...');
 */
export async function getFlashcardsByDocument(
  documentId: string,
): Promise<Flashcard[]> {
  const response = await api.get<GetFlashcardsResponse>(
    `/flashcards/${documentId}`,
  );
  return response.data.flashcards;
}

/**
 * Get all flashcards for a user.
 *
 * @example
 * const allFlashcards = await getAllUserFlashcards('db677394-...');
 */
export async function getAllUserFlashcards(
  userId: string,
): Promise<Flashcard[]> {
  const response = await api.get<GetFlashcardsResponse>(
    `/flashcards/user/${userId}`,
  );
  return response.data.flashcards;
}
