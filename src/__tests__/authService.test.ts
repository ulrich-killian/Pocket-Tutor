/**
 * Auth Service Tests
 * Tests for Supabase authentication functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signInWithOAuth: vi.fn(),
    verifyOtp: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn(),
      }),
    }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          single: vi.fn(),
        }),
      }),
    }),
  }),
};

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user with valid credentials', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'test-token' },
        } as any,
        error: null,
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: undefined,
      });
    });

    it('should throw AuthError when sign up fails', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: {
          message: 'User already registered',
          code: 'user_already_exists',
        },
      });

      await expect(
        authService.signUp({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('User already registered');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user with valid credentials', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'test-token' },
        } as any,
        error: null,
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw AuthError when credentials are invalid', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid login credentials',
          code: 'invalid_credentials',
        },
      });

      await expect(
        authService.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid login credentials');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out the current user', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(authService.signOut()).resolves.not.toThrow();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw AuthError when sign out fails', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Failed to sign out' },
      });

      await expect(authService.signOut()).rejects.toThrow('Failed to sign out');
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user when authenticated', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
        },
        error: null,
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null when not authenticated', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('getCurrentSession', () => {
    it('should return the current session when exists', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: { access_token: 'test-token', user: { id: 'test-user' } },
        },
        error: null,
      });

      const session = await authService.getCurrentSession();

      expect(session).toBeDefined();
      expect(session?.access_token).toBe('test-token');
    });

    it('should return null when no session exists', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const session = await authService.getCurrentSession();

      expect(session).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      await expect(
        authService.resetPassword('test@example.com'),
      ).resolves.not.toThrow();

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: 'pockettutor://reset-password',
        }),
      );
    });
  });

  describe('updatePassword', () => {
    it('should successfully update user password', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', password_updated: true },
        },
        error: null,
      });

      const user = await authService.updatePassword('newpassword123');

      expect(user).toBeDefined();
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });
  });

  describe('updateUserMetadata', () => {
    it('should successfully update user metadata', async () => {
      const { authService } = await import('../services/authService');

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            user_metadata: { full_name: 'John Doe' },
          },
        },
        error: null,
      });

      const user = await authService.updateUserMetadata({
        full_name: 'John Doe',
      });

      expect(user).toBeDefined();
      expect(user.user_metadata).toHaveProperty('full_name', 'John Doe');
    });
  });

  describe('onAuthStateChange', () => {
    it('should return an unsubscribe function', async () => {
      const { authService } = await import('../services/authService');

      const mockUnsubscribe = vi.fn();
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const unsubscribe = authService.onAuthStateChange(() => {});

      expect(typeof unsubscribe).toBe('function');
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});

describe('AuthError', () => {
  it('should create an AuthError with message', async () => {
    const { AuthError } = await import('../services/authService');

    const error = new AuthError('Test error message');

    expect(error.message).toBe('Test error message');
    expect(error.name).toBe('AuthError');
  });

  it('should create an AuthError with message and status code', async () => {
    const { AuthError } = await import('../services/authService');

    const error = new AuthError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
  });
});
