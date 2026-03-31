import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../src/context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type FileType = 'pdf' | 'docx' | 'txt';

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFile: (fileType?: FileType) => void;
  onUpload: (subject: string) => void;
  selectedFile: { name: string; type: string; size: number } | null;
  isUploading: boolean;
}

const FILE_TYPES: { type: FileType; icon: string; label: string }[] = [
  { type: 'pdf', icon: 'document-text', label: 'PDF' },
  { type: 'docx', icon: 'document', label: 'DOCX' },
  { type: 'txt', icon: 'reader', label: 'TXT' },
];

export default function UploadModal({
  visible,
  onClose,
  onSelectFile,
  onUpload,
  selectedFile,
  isUploading,
}: UploadModalProps) {
  const [selectedType, setSelectedType] = useState<FileType | null>(null);
  const [subject, setSubject] = useState('');
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleFileTypeSelect = (type: FileType) => {
    setSelectedType(type);
  };

  const handleSelectFile = () => {
    onSelectFile(selectedType || undefined);
  };

  const handleUpload = () => {
    onUpload(subject);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
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
                onPress={() => handleFileTypeSelect(type)}
              >
                <Ionicons
                  name={icon as any}
                  size={28}
                  color={
                    selectedType === type
                      ? colors.primary
                      : colors.textSecondary
                  }
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
            style={[
              styles.uploadArea,
              selectedFile && styles.uploadAreaWithFile,
            ]}
            onPress={handleSelectFile}
            activeOpacity={0.7}
          >
            {selectedFile ? (
              <View style={styles.selectedFileContainer}>
                <View style={styles.selectedFileIcon}>
                  <Ionicons
                    name="document-text"
                    size={32}
                    color={colors.primary}
                  />
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
                  <Ionicons
                    name="cloud-upload"
                    size={32}
                    color={colors.primary}
                  />
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
              placeholderTextColor={colors.placeholder}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (!selectedFile || isUploading) && styles.uploadButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Upload & Process'}
            </Text>
          </TouchableOpacity>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Ionicons
              name="lock-closed"
              size={14}
              color={colors.textTertiary}
            />
            <Text style={styles.privacyText}>
              Your files are stored privately and securely.
            </Text>
          </View>

          {/* Close Button Area */}
          <View style={styles.bottomActions}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close-circle-outline"
                size={28}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton}>
              <Ionicons
                name="refresh-circle-outline"
                size={28}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      maxHeight: SCREEN_HEIGHT * 0.9,
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
      borderColor: c.borderLight,
      borderRadius: 16,
      backgroundColor: c.inputBg,
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
      backgroundColor: '#DBEAFE',
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
      backgroundColor: '#DBEAFE',
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
    },
    closeButton: {
      padding: 8,
    },
  });
