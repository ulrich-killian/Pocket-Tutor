import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authService } from '../services/authService';
import { User, Session } from '@supabase/supabase-js';

// Auth state interface
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

// Auth context type
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserMetadata: (metadata: Record<string, unknown>) => Promise<void>;
}

// Default auth context
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  initialized: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUserMetadata: async () => {},
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

/**
 * Auth Provider Component
 * Wraps the app to provide auth state and methods
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        const user = await authService.getCurrentUser();

        if (isMounted) {
          setState({
            user,
            session,
            loading: false,
            initialized: true,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sign in method
  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = (await authService.signIn({
        email,
        password,
      })) as unknown as { user: User; session: Session };
      setState({
        user: response.user,
        session: response.session,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  // Sign up method
  const signUp = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await authService.signUp({ email, password });
      // Don't set user immediately as email confirmation might be required
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  // Sign out method
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await authService.signOut();
      setState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  // Reset password method
  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  // Update user metadata method
  const updateUserMetadata = useCallback(
    async (metadata: Record<string, unknown>) => {
      const user = await authService.updateUserMetadata(metadata);
      setState((prev) => ({ ...prev, user }));
    },
    [],
  );

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserMetadata,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * useAuthState Hook
 * Simplified hook for just current user and loading state
 */
export function useAuthState() {
  const { user, session, loading, initialized } = useAuth();

  return {
    user,
    session,
    loading,
    initialized,
    isAuthenticated: !!user && !!session,
  };
}

/**
 * useCurrentUser Hook
 * Hook to get just the current user
 */
export function useCurrentUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}

/**
 * Protected Route Component
 * Component that only renders children when authenticated
 */
export function ProtectedRoute({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, loading, initialized } = useAuthState();

  // Show nothing while initializing
  if (!initialized || loading) {
    return null;
  }

  // Show fallback if not authenticated
  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Guest Route Component
 * Component that only renders children when NOT authenticated
 */
export function GuestRoute({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, loading, initialized } = useAuthState();

  // Show nothing while initializing
  if (!initialized || loading) {
    return null;
  }

  // Show fallback if authenticated
  if (user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export type { AuthContextType, AuthState };
