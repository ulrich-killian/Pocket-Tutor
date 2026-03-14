import { supabase } from '../lib/supabase';

// Type definitions for chat operations
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Custom error class for chat errors
export class ChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatError';
  }
}

/**
 * Chat Service
 * Handles chat-related database operations with Supabase
 */
class ChatService {
  /**
   * Create a new chat session
   */
  async createSession(
    userId: string,
    title: string = 'New Chat',
  ): Promise<ChatSession> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
        })
        .select()
        .single();

      if (error) {
        throw new ChatError(error.message);
      }

      return data!;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to create session',
      );
    }
  }

  /**
   * Get all chat sessions for a user
   */
  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new ChatError(error.message);
      }

      return data ?? [];
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to get sessions',
      );
    }
  }

  /**
   * Get a specific chat session
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        throw new ChatError(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to get session',
      );
    }
  }

  /**
   * Update a chat session (e.g., title)
   */
  async updateSession(
    sessionId: string,
    updates: { title?: string },
  ): Promise<ChatSession> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          title: updates.title,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw new ChatError(error.message);
      }

      return data!;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to update session',
      );
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      // First delete all messages in the session
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (messagesError) {
        throw new ChatError(messagesError.message);
      }

      // Then delete the session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw new ChatError(error.message);
      }
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to delete session',
      );
    }
  }

  /**
   * Add a message to a chat session
   */
  async addMessage(
    sessionId: string,
    role: MessageRole,
    content: string,
  ): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
        })
        .select()
        .single();

      if (error) {
        throw new ChatError(error.message);
      }

      // Update the session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return data!;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to add message',
      );
    }
  }

  /**
   * Get all messages in a chat session
   */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new ChatError(error.message);
      }

      return data ?? [];
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to get messages',
      );
    }
  }

  /**
   * Delete a specific message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw new ChatError(error.message);
      }
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to delete message',
      );
    }
  }

  /**
   * Update a message (e.g., edit content)
   */
  async updateMessage(
    messageId: string,
    content: string,
  ): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ content })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        throw new ChatError(error.message);
      }

      return data!;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Failed to update message',
      );
    }
  }

  /**
   * Search messages within a session
   */
  async searchMessages(
    sessionId: string,
    query: string,
  ): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: true });

      if (error) {
        throw new ChatError(error.message);
      }

      return data ?? [];
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError(
        error instanceof Error ? error.message : 'Search failed',
      );
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
