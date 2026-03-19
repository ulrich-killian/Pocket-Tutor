import { supabase } from '../lib/supabase';

// Type definitions for document operations
export interface Document {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMetadata {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

// Custom error class for document errors
export class DocumentError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'DocumentError';
  }
}

/**
 * Document Service
 * Handles document listing, retrieval, and deletion from Supabase Storage
 */
class DocumentService {
  private bucket = 'uploads';

  /**
   * Get file type from filename
   */
  private getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      pdf: 'PDF Document',
      doc: 'Word Document',
      docx: 'Word Document',
      txt: 'Text File',
      png: 'Image',
      jpg: 'Image',
      jpeg: 'Image',
      gif: 'Image',
      mp3: 'Audio',
      wav: 'Audio',
      mp4: 'Video',
    };
    return typeMap[extension] || 'File';
  }

  /**
   * Get icon name based on file type
   */
  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const iconMap: Record<string, string> = {
      pdf: 'document-text',
      doc: 'document',
      docx: 'document',
      txt: 'document-text',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      gif: 'image',
      mp3: 'musical-note',
      wav: 'musical-note',
      mp4: 'videocam',
    };
    return iconMap[extension] || 'document';
  }

  /**
   * Get icon color based on file type
   */
  getFileIconColor(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const colorMap: Record<string, string> = {
      pdf: '#EF4444',
      doc: '#3B82F6',
      docx: '#3B82F6',
      txt: '#6B7280',
      png: '#10B981',
      jpg: '#10B981',
      jpeg: '#10B981',
      gif: '#10B981',
      mp3: '#8B5CF6',
      wav: '#8B5CF6',
      mp4: '#F59E0B',
    };
    return colorMap[extension] || '#6B7280';
  }

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Format date to human readable format
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  /**
   * List all documents for a user
   */
  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const userPath = `${userId}`;

      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list(userPath, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw new DocumentError(error.message, error.status);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Filter out placeholder files and map to Document type
      const documents: Document[] = data
        .filter(
          (file: { name: string }) => file.name !== '.emptyFolderPlaceholder',
        )
        .map(
          (file: {
            id?: string;
            name: string;
            metadata?: { size?: number };
            created_at?: string;
            updated_at?: string;
          }) => {
            const filePath = `${userPath}/${file.name}`;
            const { data: urlData } = supabase.storage
              .from(this.bucket)
              .getPublicUrl(filePath);

            return {
              id: file.id ?? file.name,
              name: file.name,
              path: filePath,
              size: file.metadata?.size ?? 0,
              type: this.getFileType(file.name),
              publicUrl: urlData.publicUrl,
              createdAt: file.created_at ?? new Date().toISOString(),
              updatedAt: file.updated_at ?? new Date().toISOString(),
            };
          },
        );

      return documents;
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(
        error instanceof Error ? error.message : 'Failed to list documents',
      );
    }
  }

  /**
   * Get a single document by path
   */
  async getDocument(filePath: string): Promise<Document | null> {
    try {
      const parts = filePath.split('/');
      const fileName = parts.pop() || '';
      const folderPath = parts.join('/');

      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list(folderPath, {
          search: fileName,
        });

      if (error) {
        throw new DocumentError(error.message, error.status);
      }

      const file = data?.find((f: { name: string }) => f.name === fileName);
      if (!file) {
        return null;
      }

      const { data: urlData } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      return {
        id: file.id ?? file.name,
        name: file.name,
        path: filePath,
        size: file.metadata?.size ?? 0,
        type: this.getFileType(file.name),
        publicUrl: urlData.publicUrl,
        createdAt: file.created_at ?? new Date().toISOString(),
        updatedAt: file.updated_at ?? new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(
        error instanceof Error ? error.message : 'Failed to get document',
      );
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) {
        throw new DocumentError(error.message, error.status);
      }
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(
        error instanceof Error ? error.message : 'Failed to delete document',
      );
    }
  }

  /**
   * Upload a document
   */
  async uploadDocument(
    userId: string,
    file: Blob | ArrayBuffer,
    fileName: string,
    contentType: string,
  ): Promise<Document> {
    try {
      const filePath = `${userId}/${Date.now()}_${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          contentType,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new DocumentError(error.message, error.status);
      }

      const { data: urlData } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      return {
        id: data.id ?? fileName,
        name: fileName,
        path: data.path,
        size: file instanceof Blob ? file.size : file.byteLength,
        type: this.getFileType(fileName),
        publicUrl: urlData.publicUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(
        error instanceof Error ? error.message : 'Failed to upload document',
      );
    }
  }

  /**
   * Download a document (returns the file URL)
   */
  async getDownloadUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw new DocumentError(error.message, error.status);
      }

      return data.signedUrl;
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(
        error instanceof Error ? error.message : 'Failed to get download URL',
      );
    }
  }
}

// Export singleton instance
export const documentService = new DocumentService();
export default documentService;
