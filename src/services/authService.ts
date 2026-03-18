import { supabase, Profile } from '../lib/supabase';
import {
  AuthSession,
  AuthTokenResponsePassword,
  User,
} from '@supabase/supabase-js';

// Type definitions for auth operations
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpParams {
  email: string;
  password: string;
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, unknown>;
  };
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface UpdateProfileParams {
  full_name?: string;
  avatar_url?: string;
}

// Custom error class for auth errors
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Authentication Service
 * Handles all Supabase auth operations with proper error handling
 */
class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(params: SignUpParams): Promise<AuthTokenResponsePassword> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          emailRedirectTo: 'pockettutor://onboarding',
          ...params.options,
        },
      });

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }

      return data as unknown as AuthTokenResponsePassword;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Sign up failed',
      );
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(params: SignInParams): Promise<AuthTokenResponsePassword> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }

      return data as unknown as AuthTokenResponsePassword;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Sign in failed',
      );
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Sign out failed',
      );
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }

      return data.user;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Failed to get user',
      );
    }
  }

  /**
   * Get the current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }

      return data.session;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Failed to get session',
      );
    }
  }

  /**
   * Reset password for a user
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pockettutor://reset-password',
      });

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Failed to reset password',
      );
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }

      return data.user;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Failed to update password',
      );
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata: Record<string, unknown>): Promise<User> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }

      return data.user;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error
          ? error.message
          : 'Failed to update user metadata',
      );
    }
  }

  /**
   * Sign in with OAuth provider (Google, Apple, etc.)
   */
  async signInWithOAuth(
    provider: 'google' | 'apple' | 'github',
  ): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'pockettutor://oauth-callback',
        },
      });

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'OAuth sign in failed',
      );
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        throw new AuthError(error.message, error.status, error.code);
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        error instanceof Error ? error.message : 'Email verification failed',
      );
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: AuthSession | null) => void,
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export type for convenience
export type { User, AuthSession };
