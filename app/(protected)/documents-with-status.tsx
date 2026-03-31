import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DocumentCardWithStatus, {
  DocumentWithStatus,
} from '../../components/DocumentCardWithStatus';
import ProcessingBanner from '../../components/ProcessingBanner';
import UploadProgress from '../../components/UploadProgress';
import { useDocumentStatus } from '../../src/hooks/useDocumentStatus';
import { supabase } from '../../src/lib/supabase';
import { documentService } from '../../src/services/document.service';
import { Document, DocumentError } from '../../src/types/document';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

const POLLING_INTERVAL = 5000; // 5 seconds

export default function DocumentsScreenWithStatus() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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

  useEffect(() => {
    if (getProcessingCount() > 0) {
      pollingRef.current = setInterval(() => {
        documents.forEach((doc) => {
          const status = getStatus(doc.id);
          if (status === 'processing') {
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0)
        return;

      const file = result.assets[0];

      if (!userId) {
        Alert.alert('Error', 'Please sign in to upload documents');
        return;
      }

      setUploading(true);
      setUploadFileName(file.name);
      setUploadProgress(0);

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

      const uploadedDoc = await documentService.uploadDocument(
        userId,
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        },
        file.name,
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      removeStatus(tempId);
      startProcessing(uploadedDoc.id);

      setDocuments((prev) => [{ ...uploadedDoc }, ...prev]);

      setTimeout(() => {
        markReady(uploadedDoc.id);
      }, 5000);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
      }, 500);
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload document',
      );
      setUploading(false);
      setUploadProgress(0);
      setUploadFileName('');
    }
  };

  const handleDelete = async (document: DocumentWithStatus) => {
    console.log('🗑️ Delete button pressed for document:', {
      id: document.id,
      title: document.title,
      path: document.path,
      status: document.status,
    });

    // Show confirmation alert first
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('❌ Delete cancelled'),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log(
              '✅ User confirmed deletion for document:',
              document.id,
            );

            if (!document.id) {
              console.error('❌ Cannot delete: Document has no ID');
              Alert.alert('Error', 'Cannot delete this document');
              return;
            }

            if (!document.path) {
              console.error('❌ Cannot delete: Document has no path');
              Alert.alert(
                'Error',
                'Cannot delete this document - missing path',
              );
              return;
            }

            try {
              console.log(
                ' Attempting to delete document from backend:',
                document.path,
              );

              await documentService.deleteDocument(document.path);
              console.log(' Delete API call successful');

              console.log(' Removing document from local state:', document.id);
              setDocuments((prev) => {
                const filtered = prev.filter((doc) => doc.id !== document.id);
                console.log(
                  ` Documents count: ${prev.length} -> ${filtered.length}`,
                );
                return filtered;
              });

              removeStatus(document.id);
              console.log('Document status removed from local cache');

              Alert.alert('Deleted', `"${document.title}" has been deleted.`);
            } catch (error) {
              console.error(' Error deleting document:', error);
              console.error('Error details:', {
                message:
                  error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
              });
              Alert.alert(
                'Error',
                `Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            }
          },
        },
      ],
    );
  };

  // Handle document press
  const handleDocumentPress = async (document: DocumentWithStatus) => {
    const status = getStatus(document.id);

    if (status === 'ready') {
      Alert.alert(document.title, `Preview: ${document.preview}`, [
        { text: 'Close', style: 'cancel' },
      ]);
    }
  };

  // Handle retry for failed documents
  const handleRetry = async (document: DocumentWithStatus) => {
    startProcessing(document.id);

    // Simulate retry processing
    setTimeout(() => {
      if (Math.random() > 0.2) {
        markReady(document.id);
      } else {
        markError(document.id);
      }
    }, 3000);
  };

  // Navbar
  const Navbar = () => (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.navbarTitle}>
        <Ionicons name="folder" size={22} color={colors.primary} />
        <Text style={styles.navbarTitleText}>My Documents</Text>
      </View>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="add" size={26} color={colors.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-open-outline" size={64} color={colors.border} />
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
          <ActivityIndicator size="large" color={colors.primary} />
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
            <Ionicons name="documents" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{documents.length}</Text>
            <Text style={styles.statLabel}>Documents</Text>
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
              status: getStatus(item.id),
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
            colors={[colors.primary]}
            tintColor={colors.primary}
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

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 50 : 40,
      paddingBottom: 16,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primaryLight,
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
      color: c.primary,
    },
    uploadButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: c.surface,
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
      color: c.text,
    },
    statLabel: {
      fontSize: 11,
      color: c.textTertiary,
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
      color: c.textSecondary,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: c.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.textTertiary,
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyUploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primary,
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
      backgroundColor: c.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });
