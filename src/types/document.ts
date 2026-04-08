export interface Document {
  id: string;
  title: string;
  path: string;
  userId: string;
  created_at: string;
  extractedTextLength?: number;
  preview?: string;
}

export interface UploadResponse extends Document {
  extractedTextLength: number;
  preview: string;
}

export class DocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentError';
  }
}

export type DocumentStatus = 'uploading' | 'processing' | 'completed' | 'error';
