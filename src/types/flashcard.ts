export interface Flashcard {
  id: string;
  front: string;
  back: string;
  documentId: string;
  userId: string;
  created_at: string;
}

export interface GenerateFlashcardsRequest {
  documentId: string;
  userId: string;
}
