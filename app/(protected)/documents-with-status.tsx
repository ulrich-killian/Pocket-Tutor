import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import DocumentCardWithStatus, {
  DocumentWithStatus,
} from '../../components/DocumentCardWithStatus';
import UploadProgress from '../../components/UploadProgress';
import ProcessingBanner from '../../components/ProcessingBanner';
import {
  documentService,
  Document,
  DocumentError,
  DocumentStatus,
} from '../../src/services/documentService';
import { useDocumentStatus } from '../../src/hooks/useDocumentStatus';
import { supabase } from '../../src/lib/supabase';

const POLLING_INTERVAL = 5000; // 5 seconds

export default function DocumentsScreenWithStatus() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const {
    getStatus,
    startUpload,
    startProcessing,
    markReady,
    markError,
    getProcessingCount,
    removeStatus,
  } = useDocumentStatus({
    onStatusChange: (docId, newStatus) => {
      if (newStatus === 'ready') {
        // Refresh documents when processing completes
        fetchDocuments();
      }
    },
  });

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    if (!userId) return;

    try {
      const docs = await documentService.getUserDocuments(userId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (error instanceof DocumentError) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId, fetchDocuments]);

  // Polling for processing documents
  useEffect(() => {
    if (getProcessingCount() > 0) {
      pollingRef.current = setInterval(() => {
        // Check status of processing documents
        documents.forEach((doc) => {
          const status = getStatus(doc.id);
          if (status === 'processing') {
            // Simulate completion after some time
            // In production, this would call the backend to check status
            const random = Math.random();
            if (random > 0.7) {
              markReady(doc.id);
            }
          }
        });
      }, POLLING_INTERVAL);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [getProcessingCount, documents, getStatus, markReady]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle document upload with progress
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      if (!userId) {
        Alert.alert('Error', 'Please sign in to upload documents');
        return;
      }

      setUploading(true);
      setUploadFileName(file.name);
      setUploadProgress(0);

      // Create a temporary document ID for tracking
      const tempId = `temp_${Date.now()}`;
      startUpload(tempId);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Read file as base64
      const fileUri = file.uri;
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      // Complete upload progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Upload document
      const uploadedDoc = await documentService.uploadDocument(
        userId,
        arrayBuffer,
        file.name,
        file.mimeType || 'application/octet-stream',
      );

      // Update status tracking
      removeStatus(tempId);
      startProcessing(uploadedDoc.id);

      // Add to local state with processing status
      const docWithStatus: Document = {
        ...uploadedDoc,
        status: 'processing' as DocumentStatus,
      };
      setDocuments((prev) => [docWithStatus, ...prev]);

      // Simulate processing completion after a delay
      setTimeout(() => {
        markReady(uploadedDoc.id);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === uploadedDoc.id
              ? { ...doc, status: 'ready' as DocumentStatus }
              : doc,
          ),
        );
      }, 5000);

      // Reset upload state
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
      }, 500);
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload document',
      );
      setUploading(false);
      setUploadProgress(0);
      setUploadFileName('');
    }
  };

  // Handle document delete
  const handleDelete = async (document: DocumentWithStatus) => {
    try {
      await documentService.deleteDocument(document.path);
      setDocuments((prev) => prev.filter((doc) => doc.id !== document.id));
      removeStatus(document.id);
      Alert.alert('Deleted', `"${document.name}" has been deleted.`);
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert(
        'Delete Failed',
        error instanceof Error ? error.message : 'Failed to delete document',
      );
    }
  };

  // Handle document press
  const handleDocumentPress = async (document: DocumentWithStatus) => {
    const status = document.status || getStatus(document.id);

    if (status === 'ready') {
      Alert.alert(
        document.name,
        `Type: ${document.type}\nSize: ${documentService.formatFileSize(document.size)}\nStatus: Ready to use`,
        [{ text: 'Close', style: 'cancel' }],
      );
    }
  };

  // Handle retry for failed documents
  const handleRetry = async (document: DocumentWithStatus) => {
    startProcessing(document.id);
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === document.id
          ? { ...doc, status: 'processing' as DocumentStatus }
          : doc,
      ),
    );

    // Simulate retry processing
    setTimeout(() => {
      if (Math.random() > 0.2) {
        markReady(document.id);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === document.id
              ? { ...doc, status: 'ready' as DocumentStatus }
              : doc,
          ),
        );
      } else {
        markError(document.id);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === document.id
              ? { ...doc, status: 'error' as DocumentStatus }
              : doc,
          ),
        );
      }
    }, 3000);
  };

  // Navbar
  const Navbar = () => (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
      </TouchableOpacity>
      <View style={styles.navbarTitle}>
        <Ionicons name="folder" size={22} color="#1E3A8A" />
        <Text style={styles.navbarTitleText}>My Documents</Text>
      </View>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#1E3A8A" />
        ) : (
          <Ionicons name="add" size={26} color="#1E3A8A" />
        )}
      </TouchableOpacity>
    </View>
  );

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Documents Yet</Text>
      <Text style={styles.emptySubtitle}>
        Upload your study materials to get started
      </Text>
      <TouchableOpacity
        style={styles.emptyUploadButton}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
            <Text style={styles.emptyUploadButtonText}>Upload Document</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar />

      {/* Processing Banner */}
      <ProcessingBanner
        count={getProcessingCount()}
        isVisible={getProcessingCount() > 0}
      />

      {/* Upload Progress */}
      <UploadProgress
        progress={uploadProgress}
        fileName={uploadFileName}
        isVisible={uploading}
      />

      {/* Document Stats */}
      {documents.length > 0 && !uploading && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="documents" size={20} color="#1E3A8A" />
            <Text style={styles.statValue}>{documents.length}</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.statValue}>
              {
                documents.filter((d) => (d.status || 'ready') === 'ready')
                  .length
              }
            </Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="server" size={20} color="#F59E0B" />
            <Text style={styles.statValue}>
              {documentService.formatFileSize(
                documents.reduce((acc, doc) => acc + doc.size, 0),
              )}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      )}

      {/* Document List */}
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCardWithStatus
            document={{
              ...item,
              status: item.status || getStatus(item.id),
            }}
            onDelete={handleDelete}
            onPress={handleDocumentPress}
            onRetry={handleRetry}
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          documents.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Upload Button */}
      {documents.length > 0 && !uploading && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleUpload}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navbarTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  listContainer: {
    padding: 20,
    paddingTop: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  emptyUploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
