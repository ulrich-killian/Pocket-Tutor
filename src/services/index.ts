// Barrel file for services
// Re-export all services and their types

// Auth Service
export {
  authService,
  AuthError,
  type AuthUser,
  type AuthState,
  type SignUpParams,
  type SignInParams,
  type UpdateProfileParams,
} from './authService';

// Document Service
export { documentService } from './document.service';
export {
  DocumentError,
  type Document,
  type UploadResponse,
  type DocumentStatus,
} from '../types/document';

// Chat Service
export { sendMessage } from './chat.service';
export type {
  MessageRole,
  ChatMessage,
  SendMessagePayload,
  SendMessageResponse,
  Source,
} from '../types/chat.types';

// API Client
export { default as api } from './api';
