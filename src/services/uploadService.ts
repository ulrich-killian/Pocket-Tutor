import { supabase } from '../lib/supabase';

// Type definitions for upload operations
export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}

export interface UploadOptions {
  bucket: string;
  path: string;
  contentType: string;
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  };
}

// Custom error class for upload errors
export class UploadError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

/**
 * Upload Service
 * Handles file uploads to Supabase Storage
 */
class UploadService {
  private defaultBucket = 'uploads';

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: Blob | ArrayBuffer,
    options: UploadOptions,
  ): Promise<UploadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(options.path, file, {
          contentType: options.contentType,
          cacheControl: options.options?.cacheControl ?? '3600',
          upsert: options.options?.upsert ?? false,
        });

      if (error) {
        throw new UploadError(error.message, error.status);
      }

      if (!data) {
        throw new UploadError('Upload failed: No data returned');
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(options.path);

      return {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl,
      };
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw new UploadError(
        error instanceof Error ? error.message : 'Upload failed',
      );
    }
  }

  /**
   * Upload an image file
   */
  async uploadImage(
    file: Blob | ArrayBuffer,
    path: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      path,
      contentType: 'image/jpeg',
    });
  }

  /**
   * Upload a document (PDF, etc.)
   */
  async uploadDocument(
    file: Blob | ArrayBuffer,
    path: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      path,
      contentType: 'application/pdf',
    });
  }

  /**
   * Upload an audio file
   */
  async uploadAudio(
    file: Blob | ArrayBuffer,
    path: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      path,
      contentType: 'audio/mpeg',
    });
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        throw new UploadError(error.message, error.status);
      }
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw new UploadError(
        error instanceof Error ? error.message : 'Delete failed',
      );
    }
  }

  /**
   * Get a public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * List files in a bucket/path
   */
  async listFiles(
    bucket: string,
    path: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<{ name: string; id: string; updatedAt: string }[]> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(path, {
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
      });

      if (error) {
        throw new UploadError(error.message, error.status);
      }

      return (
        data?.map((item) => ({
          name: item.name,
          id: item.id ?? '',
          updatedAt: item.updated_at ?? '',
        })) ?? []
      );
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw new UploadError(
        error instanceof Error ? error.message : 'List files failed',
      );
    }
  }

  /**
   * Copy a file within a bucket
   */
  async copyFile(
    bucket: string,
    fromPath: string,
    toPath: string,
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath);

      if (error) {
        throw new UploadError(error.message, error.status);
      }

      return data?.path ?? '';
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw new UploadError(
        error instanceof Error ? error.message : 'Copy file failed',
      );
    }
  }

  /**
   * Move a file within a bucket
   */
  async moveFile(
    bucket: string,
    fromPath: string,
    toPath: string,
  ): Promise<void> {
    try {
      // Copy to new location
      await this.copyFile(bucket, fromPath, toPath);
      // Delete original
      await this.deleteFile(bucket, fromPath);
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw new UploadError(
        error instanceof Error ? error.message : 'Move file failed',
      );
    }
  }

  /**
   * Download a file from Supabase Storage
   */
  async downloadFile(bucket: string, path: string): Promise<ArrayBuffer> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        throw new UploadError(error.message, error.status);
      }

      if (!data) {
        throw new UploadError('Download failed: No data returned');
      }

      return data.arrayBuffer();
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw new UploadError(
        error instanceof Error ? error.message : 'Download failed',
      );
    }
  }

  /**
   * Create a signed URL for temporary access to a private file
   */
  async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw new UploadError(error.message, error.status);
      }

      return data?.signedUrl ?? '';
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw new UploadError(
        error instanceof Error ? error.message : 'Create signed URL failed',
      );
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();
