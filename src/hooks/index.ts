// Export all hooks
export {
  useAuth,
  AuthProvider,
  useAuthState,
  useCurrentUser,
  ProtectedRoute,
  GuestRoute,
} from './useAuth';
export type { AuthContextType, AuthState } from './useAuth';

export { useDocumentStatus } from './useDocumentStatus';
export type { DocumentStatus } from './useDocumentStatus';
