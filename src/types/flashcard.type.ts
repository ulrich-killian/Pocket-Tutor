// types/flashcard.type.ts

/**
 * Flashcard interface that supports both snake_case (Supabase)
 * and camelCase (frontend) formats
 */
export interface Flashcard {
  // Unique identifier
  id?: string;

  // Card content
  front: string;
  back: string;

  // Snake_case fields (from Supabase database)
  document_id?: string;
  user_id?: string;
  created_at?: string;

  // CamelCase aliases (for frontend convenience)
  documentId?: string;
  userId?: string;
  createdAt?: string;
}

/**
 * A deck of flashcards grouped by document or custom creation
 */
export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  color: string;
  lastStudied?: string;
  documentId?: string;
  userId?: string;
}

/**
 * Payload for generating flashcards from a document
 */
export interface GenerateFlashcardsPayload {
  documentId: string;
  userId: string;
}

/**
 * Response from generating flashcards
 */
export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
}

/**
 * Response for getting flashcards
 */
export interface GetFlashcardsResponse {
  flashcards: Flashcard[];
}
