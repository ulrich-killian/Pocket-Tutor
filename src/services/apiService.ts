import { supabase } from '../lib/supabase';

// Backend API URL - change this to your deployed backend URL in production
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiDocument {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  mimeType: string;
  publicUrl: string;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

/**
 * API Service for communicating with the backend
 */
class ApiService {
  private baseUrl = API_BASE_URL;

  /**
   * Get authorization header with current user's token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  /**
   * Make an authenticated request to the backend
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Upload a document to the backend
   */
  async uploadDocument(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<ApiDocument> {
    const headers = await this.getAuthHeaders();

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await fetch(`${this.baseUrl}/resources/upload`, {
      method: 'POST',
      headers: {
        ...headers,
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Upload failed');
    }

    const result: ApiResponse<ApiDocument> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Upload failed');
    }

    return result.data;
  }

  /**
   * Get all documents for the current user
   */
  async getDocuments(): Promise<ApiDocument[]> {
    const result = await this.request<ApiDocument[]>('/resources');

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch documents');
    }

    return result.data || [];
  }

  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<ApiDocument> {
    const result = await this.request<ApiDocument>(`/resources/${id}`);

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Document not found');
    }

    return result.data;
  }

  /**
   * Get download URL for a document
   */
  async getDownloadUrl(id: string): Promise<string> {
    const result = await this.request<{ url: string }>(
      `/resources/${id}/download`,
    );

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to get download URL');
    }

    return result.data.url;
  }

  /**
   * Delete a document by ID
   */
  async deleteDocument(id: string): Promise<void> {
    const result = await this.request<null>(`/resources/${id}`, {
      method: 'DELETE',
    });

    if (!result.success) {
      throw new Error(result.message || 'Failed to delete document');
    }
  }

  /**
   * Delete a document by file path
   */
  async deleteDocumentByPath(path: string): Promise<void> {
    const result = await this.request<null>(`/resources/path/${path}`, {
      method: 'DELETE',
    });

    if (!result.success) {
      throw new Error(result.message || 'Failed to delete document');
    }
  }

  /**
   * Check if backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
