import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ProcessingScreen, {
  ProcessingStep,
} from '../../components/ProcessingScreen';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';
import { SelectedFile, useFilePicker } from '../../src/hooks/useFilePicker';
import { supabase } from '../../src/lib/supabase';
import { documentService } from '../../src/services/document.service';

type FileType = 'pdf' | 'docx' | 'txt';

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

export default function UploadScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [selectedType, setSelectedType] = useState<FileType | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>(null);
  const [subject, setSubject] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] =
    useState<ProcessingStep>('uploading');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const { selectFile: pickFile, inputRef } = useFilePicker();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSelectFile = async (fileType?: FileType) => {
    const mimeTypes = getMimeTypeForFileType(
      fileType || selectedType || undefined,
    );
    const file = await pickFile(mimeTypes);

    if (!file) return;

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      Alert.alert('File Too Large', 'Maximum file size is 20MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Please sign in to upload documents');
        return;
      }

      setIsProcessing(true);
      setProcessingStep('uploading');
      setErrorMessage(undefined);

      await documentService.uploadDocument(
        user.id,
        {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type,
        },
        subject || selectedFile.name,
      );

      setProcessingStep('extracting');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProcessingStep('generating');
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setProcessingStep('ready');
    } catch (error) {
      setProcessingStep('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Upload failed. Please try again.',
      );
    }
  };

  const handleProcessingComplete = () => {
    router.replace('/(protected)/documents');
  };

  const handleProcessingClose = () => {
    setIsProcessing(false);
    setProcessingStep('uploading');
    setErrorMessage(undefined);
  };

  // Show processing screen when uploading
  if (isProcessing) {
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

  return (
    <View style={styles.container}>
      {/* Single hidden file input for web - outside everything */}
      {Platform.OS === 'web' && (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="file"
          onChange={() => {}}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            width: 0,
            height: 0,
          }}
          accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain"
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dragHandle} />
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

        {/* Upload Area - NO input element inside here anymore */}
        <TouchableOpacity
          style={[styles.uploadArea, selectedFile && styles.uploadAreaWithFile]}
          onPress={() => handleSelectFile()}
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
                onPress={() => handleSelectFile()}
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

        <Text style={styles.maxSizeText}>Max file size: 20MB</Text>

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

        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
          <Text style={styles.privacyText}>
            Your files are stored privately and securely.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close-circle-outline" size={28} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionIconButton}
          onPress={() => {
            setSelectedFile(null);
            setSubject('');
            setSelectedType(null);
          }}
        >
          <Ionicons name="refresh-circle-outline" size={28} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 8,
      backgroundColor: c.headerBg,
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
      color: c.headerText,
    },
    headerSpacer: {
      width: 40,
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
      backgroundColor: c.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
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
      borderColor: c.border,
      backgroundColor: c.surface,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    fileTypeButtonSelected: {
      borderColor: c.primary,
      backgroundColor: c.primaryLight,
    },
    fileTypeLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textSecondary,
    },
    fileTypeLabelSelected: {
      color: c.primary,
    },
    uploadArea: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.border,
      borderRadius: 16,
      backgroundColor: c.surfaceSecondary,
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 12,
    },
    uploadAreaWithFile: {
      backgroundColor: c.primaryLight,
      borderColor: c.primary,
      borderStyle: 'solid',
      paddingVertical: 24,
    },
    uploadIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    uploadText: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    uploadSubtext: {
      fontSize: 14,
      color: c.textTertiary,
    },
    selectedFileContainer: {
      alignItems: 'center',
    },
    selectedFileIcon: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: c.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    selectedFileName: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
      maxWidth: 250,
    },
    selectedFileSize: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 12,
    },
    changeFileButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: c.surface,
    },
    changeFileText: {
      fontSize: 14,
      fontWeight: '500',
      color: c.primary,
    },
    maxSizeText: {
      fontSize: 13,
      color: c.textTertiary,
      textAlign: 'center',
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: c.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: c.inputText,
      backgroundColor: c.inputBg,
    },
    uploadButton: {
      backgroundColor: c.primary,
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
      color: c.textTertiary,
    },
    bottomActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      paddingVertical: 16,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    actionIconButton: {
      padding: 8,
    },
  });
