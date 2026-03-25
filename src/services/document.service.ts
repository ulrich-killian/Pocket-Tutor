import api from './api';
import { Document, UploadResponse, DocumentError } from '../types/document';

export const documentService = {
  async uploadDocument(
    userId: string,
    file: { uri: string; name: string; type: string },
    title: string,
  ): Promise<UploadResponse> {
    try {
      console.log('--- Upload Start ---');
      console.log('Target URL:', `${api.defaults.baseURL}/documents/upload`);

      const formData = new FormData();

      formData.append('userId', userId);
      formData.append('title', title);

      const filePayload = {
        uri: file.uri,
        name: file.name || 'upload.pdf',
        type: file.type || 'application/pdf',
      };

      formData.append('file', filePayload as any);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },

        transformRequest: (data) => data,
        timeout: 60000,
      });

      console.log('Upload success:', response.data);
      return response.data.data || response.data;
    } catch (err: any) {
      console.error('Upload error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        axiosError: err.isAxiosError ? 'Yes' : 'No',
      });

      throw new DocumentError(
        err.response?.data?.message || err.message || 'Upload failed',
      );
    }
  },

  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      console.log(' Fetching documents for user:', userId);
      const response = await api.get(`/documents/${userId}`);
      console.log(' Raw response:', response.data);

      let documents: Document[] = [];

      if (Array.isArray(response.data)) {
        documents = response.data;
      } else if (
        response.data.documents &&
        Array.isArray(response.data.documents)
      ) {
        documents = response.data.documents;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        documents = response.data.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        documents = [];
      }

      console.log(`Found ${documents.length} documents`);
      return documents;
    } catch (err: any) {
      console.error('Fetch documents error:', err.message);
      throw new DocumentError(err.message || 'Failed to fetch documents');
    }
  },

  async deleteDocument(path: string): Promise<void> {
    try {
      console.log(' deleteDocument called with path:', path);

      if (!path) {
        console.error(' deleteDocument: No path provided');
        throw new DocumentError('Document path is required');
      }

      const response = await api.delete('/documents', {
        data: { path },
      });

      console.log('deleteDocument response:', {
        status: response.status,
        data: response.data,
      });

      return response.data;
    } catch (err: any) {
      console.error(' deleteDocument error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data,
        },
      });
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
