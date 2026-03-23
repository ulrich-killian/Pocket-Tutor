import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Document, DocumentError } from '../../src/types/document';
import { documentService } from '../../src/services/document.service';
import ProcessingScreen, {
  ProcessingStep,
} from '../../components/ProcessingScreen';
import DocumentCard from '../../components/DocumentCard';
import { supabase } from '../../src/lib/supabase';

type FileType = 'pdf' | 'docx' | 'txt';
type ScreenView = 'upload' | 'list' | 'processing';

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const FILE_TYPES: { type: FileType; icon: string; label: string }[] = [
  { type: 'pdf', icon: 'document-text', label: 'PDF' },
  { type: 'docx', icon: 'document', label: 'DOCX' },
  { type: 'txt', icon: 'reader', label: 'TXT' },
];

const getMimeTypeForFileType = (fileType?: FileType): string[] => {
  switch (fileType) {
    case 'pdf':
      return ['application/pdf'];
    case 'docx':
      return [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
    case 'txt':
      return ['text/plain'];
    default:
      return [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
  }
};

export default function DocumentsScreen() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ScreenView>('upload');
  const [selectedType, setSelectedType] = useState<FileType | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [subject, setSubject] = useState('');
  const [processingStep, setProcessingStep] =
    useState<ProcessingStep>('uploading');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

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

      // Check file size (max 20MB)
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

      console.log('Uploaded document:', uploadedDoc);

      setProcessingStep('extracting');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProcessingStep('generating');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProcessingStep('ready');

      // Wait a moment before showing success
      setTimeout(() => {
        setCurrentView('list');
        setSelectedFile(null);
        setSubject('');
        setSelectedType(null);
        fetchDocuments(); // Refresh the document list
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
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
    Alert.alert(document.title, `Preview: ${document.preview}`, [
      { text: 'Close', style: 'cancel' },
    ]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, [fetchDocuments]);

  // Processing Screen
  if (currentView === 'processing') {
    return (
      <ProcessingScreen
        fileName={selectedFile?.name || 'Document'}
        currentStep={processingStep}
        onComplete={handleProcessingComplete}
        onClose={handleProcessingClose}
        errorMessage={errorMessage}
      />
    );
  }

  // Document List View
  if (currentView === 'list') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.listHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('upload')}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.listHeaderTitle}>My Documents</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setCurrentView('upload')}
          >
            <Ionicons name="add" size={24} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E3A8A" />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No documents yet</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setCurrentView('upload')}
            >
              <Text style={styles.emptyButtonText}>Upload your first file</Text>
            </TouchableOpacity>
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

  // Upload View (Default)
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pocket Tutor</Text>
        <TouchableOpacity
          style={styles.listButton}
          onPress={() => setCurrentView('list')}
        >
          <Ionicons name="folder-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Title */}
        <Text style={styles.title}>Upload Study Material</Text>

        {/* File Type Selector */}
        <View style={styles.fileTypesContainer}>
          {FILE_TYPES.map(({ type, icon, label }) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.fileTypeButton,
                selectedType === type && styles.fileTypeButtonSelected,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Ionicons
                name={icon as any}
                size={28}
                color={selectedType === type ? '#1E3A8A' : '#6B7280'}
              />
              <Text
                style={[
                  styles.fileTypeLabel,
                  selectedType === type && styles.fileTypeLabelSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upload Area */}
        <TouchableOpacity
          style={[styles.uploadArea, selectedFile && styles.uploadAreaWithFile]}
          onPress={handleSelectFile}
          activeOpacity={0.7}
        >
          {selectedFile ? (
            <View style={styles.selectedFileContainer}>
              <View style={styles.selectedFileIcon}>
                <Ionicons name="document-text" size={32} color="#1E3A8A" />
              </View>
              <Text style={styles.selectedFileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={styles.selectedFileSize}>
                {formatFileSize(selectedFile.size)}
              </Text>
              <TouchableOpacity
                style={styles.changeFileButton}
                onPress={handleSelectFile}
              >
                <Text style={styles.changeFileText}>Change file</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload" size={32} color="#1E3A8A" />
              </View>
              <Text style={styles.uploadText}>Tap to choose a file</Text>
              <Text style={styles.uploadSubtext}>or drag and drop here</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Max File Size */}
        <Text style={styles.maxSizeText}>Max file size: 20MB</Text>

        {/* Subject Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Subject (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Biology, Chemistry"
            placeholderTextColor="#9CA3AF"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            !selectedFile && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!selectedFile}
        >
          <Text style={styles.uploadButtonText}>Upload & Process</Text>
        </TouchableOpacity>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
          <Text style={styles.privacyText}>
            Your files are stored privately and securely.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close-circle-outline" size={28} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconButton} onPress={handleReset}>
          <Ionicons name="refresh-circle-outline" size={28} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#1E3A8A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  fileTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  fileTypeButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  fileTypeButtonSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EEF2FF',
  },
  fileTypeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  fileTypeLabelSelected: {
    color: '#1E3A8A',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadAreaWithFile: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1E3A8A',
    borderStyle: 'solid',
    paddingVertical: 24,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  selectedFileContainer: {
    alignItems: 'center',
  },
  selectedFileIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    maxWidth: 250,
  },
  selectedFileSize: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  changeFileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  changeFileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  maxSizeText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  uploadButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionIconButton: {
    padding: 8,
  },
  // List View Styles
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
