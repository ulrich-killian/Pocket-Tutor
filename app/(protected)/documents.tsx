import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Document, DocumentError } from '../../src/types/document';
import { documentService } from '../../src/services/document.service';
import DocumentCard from '../../components/DocumentCard';
import { supabase } from '../../src/lib/supabase';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

export default function DocumentsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSelectFile = async () => {
    if (Platform.OS === 'web') {
      // Web fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg';

      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Maximum file size is 20MB');
          return;
        }

        setSelectedFile({
          uri: URL.createObjectURL(file),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
        });
      };

      input.click();
      return; // 👈 stops here on web, doesn't touch DocumentPicker
    }

    // ✅ Your existing mobile code stays exactly as is below
    try {
      const mimeTypes = getMimeTypeForFileType(selectedType || undefined);

      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      if (file.size && file.size > 20 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Maximum file size is 20MB');
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
        size: file.size || 0,
      });
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) {
      Alert.alert('Error', 'Please sign in to upload documents');
      return;
    }

    try {
      setCurrentView('processing');
      setProcessingStep('uploading');
      setErrorMessage(undefined);

      console.log(' Starting upload for:', selectedFile.name);

      // Upload and get the response
      const uploadedDoc = await documentService.uploadDocument(
        userId,
        {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type,
        },
        subject || selectedFile.name,
      );

      console.log(' Upload successful! Document:', uploadedDoc);
      console.log(' Document ID:', uploadedDoc.id);

      setProcessingStep('extracting');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProcessingStep('generating');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProcessingStep('ready');

      // Navigate directly to chat with the uploaded document
      setTimeout(() => {
        console.log('Navigating to chat with document:', uploadedDoc.id);
        // Reset form state
        setSelectedFile(null);
        setSubject('');
        setSelectedType(null);
        // Navigate to chat
        router.push({
          pathname: '/chat',
          params: { documentId: uploadedDoc.id },
        });
      }, 1500);
    } catch (error) {
      console.error(' Upload error:', error);
      setProcessingStep('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Upload failed. Please try again.',
      );
    }
  };
  // end here
  const handleProcessingComplete = () => {
    // Reset and show list
    setSelectedFile(null);
    setSubject('');
    setSelectedType(null);
    setCurrentView('list');
    fetchDocuments();
  };

  const handleProcessingClose = () => {
    setCurrentView('upload');
    setProcessingStep('uploading');
    setErrorMessage(undefined);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSubject('');
    setSelectedType(null);
  };

  const handleDelete = async (document: Document) => {
    try {
      await documentService.deleteDocument(document.path);
      setDocuments((prev) => prev.filter((doc) => doc.id !== document.id));
      Alert.alert('Deleted', `"${document.title}" has been deleted.`);
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert(
        'Delete Failed',
        error instanceof Error ? error.message : 'Failed to delete document',
      );
    }
  };

  const handleDocumentPress = (document: Document) => {
    console.log(' Document pressed:', document);
    console.log(' Document ID:', document.id);
    console.log(' Document title:', document.title);

    if (!document.id) {
      console.error(' Document has no ID!');
      Alert.alert('Error', 'Cannot open this document');
      return;
    }

    Alert.alert(
      document.title,
      'What would you like to do with this document?',
      [
        {
          text: 'Chat with AI',
          onPress: () =>
            router.push({
              pathname: '/chat',
              params: { documentId: document.id },
            }),
        },
        {
          text: 'Take a Quiz',
          onPress: () =>
            router.push({
              pathname: '/quiz',
              params: { documentId: document.id },
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.listHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.listHeaderTitle}>My Documents</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No documents uploaded yet</Text>
          <Text style={styles.emptySubtext}>
            Files you upload will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onDelete={handleDelete}
              onPress={handleDocumentPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E3A8A']}
            />
          }
        />
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
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    listHeaderTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.text,
    },
    placeholder: {
      width: 40,
      height: 40,
    },
    listContent: {
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      color: c.textSecondary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: c.textTertiary,
    },
  });
