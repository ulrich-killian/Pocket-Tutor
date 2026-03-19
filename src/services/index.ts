// Export all services
export { authService, AuthError } from './authService';
export type {
  AuthUser,
  AuthState,
  SignUpParams,
  SignInParams,
  UpdateProfileParams,
} from './authService';

export { uploadService, UploadError } from './uploadService';
export type { UploadResult, UploadOptions } from './uploadService';

export { chatService, ChatError } from './chatService';
export type { MessageRole, ChatMessage, ChatSession } from './chatService';

export { documentService, DocumentError } from './documentService';
export type { Document, DocumentMetadata } from './documentService';

export { apiService } from './apiService';
export type { ApiDocument, ApiResponse } from './apiService';
