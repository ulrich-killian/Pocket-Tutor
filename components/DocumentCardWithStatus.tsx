import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge, { DocumentStatus } from './StatusBadge';
import { Document, documentService } from '../src/services/documentService';

export interface DocumentWithStatus extends Document {
  status?: DocumentStatus;
}

interface DocumentCardWithStatusProps {
  document: DocumentWithStatus;
  onDelete: (document: DocumentWithStatus) => void;
  onPress?: (document: DocumentWithStatus) => void;
  onRetry?: (document: DocumentWithStatus) => void;
}

export default function DocumentCardWithStatus({
  document,
  onDelete,
  onPress,
  onRetry,
}: DocumentCardWithStatusProps) {
  const iconName = documentService.getFileIcon(
    document.name,
  ) as keyof typeof Ionicons.glyphMap;
  const iconColor = documentService.getFileIconColor(document.name);
  const formattedSize = documentService.formatFileSize(document.size);
  const formattedDate = documentService.formatDate(document.createdAt);
  const status = document.status || 'ready';

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(document),
        },
      ],
    );
  };

  const handlePress = () => {
    if (status === 'error' && onRetry) {
      Alert.alert(
        'Processing Error',
        'Would you like to retry processing this document?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => onRetry(document) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(document),
          },
        ],
      );
      return;
    }

    if (status === 'processing' || status === 'uploading') {
      Alert.alert(
        'Please Wait',
        "This document is still being processed. Please wait until it's ready.",
      );
      return;
    }

    if (onPress) {
      onPress(document);
    }
  };

  const isProcessing = status === 'uploading' || status === 'processing';

  return (
    <TouchableOpacity
      style={[styles.container, isProcessing && styles.containerProcessing]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconColor + '15' },
          isProcessing && styles.iconContainerProcessing,
        ]}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={isProcessing ? '#9CA3AF' : iconColor}
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.name, isProcessing && styles.nameProcessing]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {document.name}
        </Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>{formattedSize}</Text>
          <Text style={styles.metadataDot}>•</Text>
          <Text style={styles.metadataText}>{formattedDate}</Text>
        </View>

        {/* Status Badge */}
        <StatusBadge status={status} size="small" showLabel={true} />
      </View>

      {/* Only show delete button when not processing */}
      {!isProcessing && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}

      {/* Show cancel button when processing */}
      {isProcessing && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerProcessing: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerProcessing: {
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  nameProcessing: {
    color: '#9CA3AF',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  metadataDot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
