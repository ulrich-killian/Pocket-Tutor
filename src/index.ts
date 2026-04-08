/**
 * Pocket Tutor - Supabase Integration
 *
 * This module provides a complete Supabase integration with:
 * - Authentication (sign up, sign in, password reset, OAuth)
 * - File uploads (images, documents, audio)
 * - Real-time chat functionality
 * - Custom React hooks for auth state management
 * - Pre-built UI screens (Login, Signup)
 *
 * Quick Start:
 * 1. Copy .env.example to .env and fill in your Supabase credentials
 * 2. Wrap your app with AuthProvider
 * 3. Use the services and hooks as needed
 */

// Re-export lib (Supabase client)
export { supabase } from './lib';
export type { Database, Profile } from './lib';

// Re-export services
export { authService, AuthError } from './services';
export type {
  AuthUser,
  AuthState,
  SignUpParams,
  SignInParams,
  UpdateProfileParams,
} from './services';
export { documentService, DocumentError } from './services';
export type { Document, UploadResponse, DocumentStatus } from './services';
export { sendMessage } from './services';
export type {
  MessageRole,
  ChatMessage,
  SendMessagePayload,
  SendMessageResponse,
  Source,
} from './services';

// Re-export hooks
export {
  useAuth,
  AuthProvider,
  useAuthState,
  useCurrentUser,
  ProtectedRoute,
  GuestRoute,
} from './hooks';
export type { AuthContextType, AuthState as AuthHookState } from './hooks';

// Re-export screens
export { LoginScreen, SignupScreen } from './screens';
