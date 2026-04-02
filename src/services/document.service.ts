import api from './api';
import { Document, UploadResponse, DocumentError } from '../types/document';
import { Platform } from 'react-native';

export const documentService = {
  async uploadDocument(
    userId: string,
    file: { uri: string; name: string; type: string },
    title: string,
  ): Promise<UploadResponse> {
    try {
      console.log('--- Upload Start ---');
      console.log('Target URL:', `${api.defaults.baseURL}/documents/upload`);
      console.log('FILE:', file);

      const formData = new FormData();

      formData.append('userId', userId);
      formData.append('title', title);

      if (Platform.OS === 'web') {
        const blob = await uriToBlob(file.uri);
        formData.append('file', blob, file.name || 'upload.pdf');
      } else {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'upload.pdf',
          type: file.type || 'application/octet-stream',
        } as any);
      }

      const response = await api.post('/documents/upload', formData, {
        headers: {
          Accept: 'application/json',
        },
      });

      // For axios, response.data contains the data directly
      console.log('Upload success:', response.data);
      return response.data;
    } catch (err: any) {
      // Log detailed error information for debugging
      console.error('=== Upload Error Debug ===');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Is Axios Error:', err.isAxiosError);
      console.error('Response:', err.response?.data);
      console.error('Status:', err.response?.status);
      console.error('=========================');

      // Provide more helpful error messages
      let errorMessage = 'Upload failed. Please try again.';

      if (err.code === 'ECONNABORTED') {
        errorMessage =
          'Request timed out. Please check your network connection.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage =
          'Network error. Please make sure you are connected to the same WiFi network as the server.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File is too large. Maximum file size is 20MB.';
      } else if (err.response?.status === 415) {
        errorMessage =
          'Unsupported file type. Please upload a PDF, DOCX, or TXT file.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      throw new DocumentError(errorMessage);
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
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}
