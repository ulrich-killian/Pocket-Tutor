// types/flashcard.type.ts

export interface Flashcard {
  id: string;
  // Backend field names
  front: string;
  back: string;
  // UI field names (aliases for front/back)
  term?: string;
  definition?: string;
  documentId: string;
  userId?: string;
  createdAt?: string;
}

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

export interface GenerateFlashcardsPayload {
  documentId: string;
  userId: string;
}

export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
}

export interface GetFlashcardsResponse {
  flashcards: Flashcard[];
}
