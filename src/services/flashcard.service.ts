// services/flashcard.service.ts

import api from './api';
import type {
  Flashcard,
  FlashcardDeck,
  GenerateFlashcardsPayload,
  GenerateFlashcardsResponse,
  GetFlashcardsResponse,
} from '../types/flashcard.type';

/**
 * Custom error class for flashcard operations
 */
export class FlashcardError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'FlashcardError';
  }
}

/**
 * Configuration for generating flashcards
 */
export interface GenerateFlashcardsOptions {
  /** The document ID to generate flashcards from */
  documentId: string;
  /** The user's ID */
  userId: string;
  /** Optional: Number of flashcards to generate (default: 5-8) */
  count?: number;
}

/**
 * Configuration for getting flashcards
 */
export interface GetFlashcardsOptions {
  /** Filter by document ID */
  documentId?: string;
  /** Filter by user ID */
  userId?: string;
}

/**
 * API Response format from Supabase (snake_case)
 * This is what the backend returns
 */
interface SupabaseFlashcard {
  id?: string;
  front: string;
  back: string;
  document_id?: string;
  user_id?: string;
  created_at?: string;
}

/**
 * Transform raw flashcard data from API to ensure consistent format
 * The API returns snake_case from Supabase, we normalize to both formats
 */
function transformFlashcard(card: SupabaseFlashcard): Flashcard {
  return {
    id: card.id,
    front: card.front,
    back: card.back,
    document_id: card.document_id,
    user_id: card.user_id,
    created_at: card.created_at,
    // Ensure camelCase versions exist for consistent grouping
    documentId: card.document_id,
    userId: card.user_id,
    createdAt: card.created_at,
  };
}

/**
 * Transform an array of flashcards
 */
function transformFlashcards(cards: SupabaseFlashcard[]): Flashcard[] {
  return cards.map(transformFlashcard);
}

/**
 * Generate flashcards from a document using AI.
 *
 * @param payload - The payload containing documentId and userId
 * @returns Promise resolving to array of generated flashcards
 * @throws {FlashcardError} If generation fails
 *
 * @example
 * ```ts
 * const flashcards = await generateFlashcards({
 *   documentId: 'cc2b20ff-...',
 *   userId: 'db677394-...',
 * });
 * ```
 */
export async function generateFlashcards(
  payload: GenerateFlashcardsPayload,
): Promise<Flashcard[]> {
  try {
    const response = await api.post<GenerateFlashcardsResponse>(
      '/flashcards/generate',
      {
        documentId: payload.documentId,
        userId: payload.userId,
      },
    );

    return transformFlashcards(response.data.flashcards as SupabaseFlashcard[]);
  } catch (error: any) {
    if (error instanceof FlashcardError) {
      throw error;
    }

    const message =
      error.response?.data?.message || 'Failed to generate flashcards';
    const statusCode = error.response?.status;

    throw new FlashcardError(message, 'GENERATION_FAILED', statusCode);
  }
}

/**
 * Get flashcards for a specific document.
 *
 * @param documentId - The document ID to get flashcards for
 * @returns Promise resolving to array of flashcards for the document
 * @throws {FlashcardError} If retrieval fails
 *
 * @example
 * ```ts
 * const flashcards = await getFlashcardsByDocument('cc2b20ff-...');
 * ```
 */
export async function getFlashcardsByDocument(
  documentId: string,
): Promise<Flashcard[]> {
  try {
    const response = await api.get<GetFlashcardsResponse>(
      `/flashcards/${documentId}`,
    );

    return transformFlashcards(response.data.flashcards as SupabaseFlashcard[]);
  } catch (error: any) {
    if (error instanceof FlashcardError) {
      throw error;
    }

    const message =
      error.response?.data?.message || 'Failed to fetch flashcards';
    const statusCode = error.response?.status;

    throw new FlashcardError(message, 'FETCH_FAILED', statusCode);
  }
}

/**
 * Get all flashcards for a user.
 *
 * @param userId - The user's ID
 * @returns Promise resolving to array of all user's flashcards
 * @throws {FlashcardError} If retrieval fails
 *
 * @example
 * ```ts
 * const allFlashcards = await getAllUserFlashcards('db677394-...');
 * ```
 */
export async function getAllUserFlashcards(
  userId: string,
): Promise<Flashcard[]> {
  try {
    const response = await api.get<GetFlashcardsResponse>(
      `/flashcards/user/${userId}`,
    );

    return transformFlashcards(response.data.flashcards as SupabaseFlashcard[]);
  } catch (error: any) {
    if (error instanceof FlashcardError) {
      throw error;
    }

    const message =
      error.response?.data?.message || 'Failed to fetch user flashcards';
    const statusCode = error.response?.status;

    throw new FlashcardError(message, 'FETCH_FAILED', statusCode);
  }
}

/**
 * Group flashcards by document into decks
 * This creates FlashcardDeck objects from flat flashcard data
 *
 * @param flashcards - Array of flashcards to group
 * @param documentTitles - Optional map of document IDs to titles
 * @returns Array of flashcard decks
 *
 * @example
 * ```ts
 * const flashcards = await getAllUserFlashcards(userId);
 * const decks = groupFlashcardsIntoDecks(flashcards, docTitles);
 * ```
 */
export function groupFlashcardsIntoDecks(
  flashcards: Flashcard[],
  documentTitles: Record<string, string> = {},
): FlashcardDeck[] {
  const deckColors = [
    '#4F46E5',
    '#10B981',
    '#F59E0B',
    '#EC4899',
    '#06B6D4',
    '#8B5CF6',
  ];

  const grouped = flashcards.reduce<Record<string, FlashcardDeck>>(
    (acc, card) => {
      // Support both snake_case and camelCase
      const docId = card.document_id || card.documentId || 'local';

      if (!acc[docId]) {
        const title = documentTitles[docId]
          ? `${documentTitles[docId]} Flashcards`
          : 'Custom Flashcards';

        acc[docId] = {
          id: docId,
          title,
          subject: documentTitles[docId] ? 'From Document' : 'Custom',
          color: deckColors[Object.keys(acc).length % deckColors.length],
          cards: [],
          documentId: docId,
          userId: card.user_id || card.userId,
        };
      }

      acc[docId].cards.push(card);
      return acc;
    },
    {},
  );

  return Object.values(grouped);
}

/**
 * Calculate statistics for a user's flashcards
 *
 * @param flashcards - Array of flashcards
 * @returns Object containing deck and card counts
 *
 * @example
 * ```ts
 * const stats = calculateFlashcardStats(flashcards);
 * console.log(stats.totalDecks, stats.totalCards);
 * ```
 */
export function calculateFlashcardStats(flashcards: Flashcard[]): {
  totalDecks: number;
  totalCards: number;
} {
  const uniqueDocumentIds = new Set(
    flashcards.map((c) => c.document_id || c.documentId).filter(Boolean),
  );

  return {
    totalDecks: uniqueDocumentIds.size || (flashcards.length > 0 ? 1 : 0),
    totalCards: flashcards.length,
  };
}
