import api from './api';
import { Document, UploadResponse, DocumentError } from '../types/document';

export const documentService = {
  async uploadDocument(
    userId: string,
    file: { uri: string; name: string; type: string },
    title: string,
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();

      formData.append('userId', userId);
      formData.append('title', title);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          Accept: 'application/json',
        },
        timeout: 60000,
      });

      // Your backend returns { message: 'Document processed successfully', data: {...} }
      // So we need to extract the data from response.data.data
      const uploadResponse = response.data.data;

      console.log('Upload success:', uploadResponse);

      return uploadResponse;
    } catch (err: any) {
      console.error('Upload error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      throw new DocumentError(
        err.response?.data?.message || err.message || 'Upload failed',
      );
    }
  },

  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const response = await api.get<Document[]>(`/documents/${userId}`);
      return response.data;
    } catch (err: any) {
      console.error('Fetch documents error:', err.message);
      throw new DocumentError(err.message || 'Failed to fetch documents');
    }
  },

  async deleteDocument(path: string): Promise<void> {
    try {
      await api.delete('/documents', { data: { path } });
    } catch (err: any) {
      console.error('Delete document error:', err.message);
      throw new DocumentError(err.message || 'Failed to delete document');
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },
};
