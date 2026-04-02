import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '../src/types/document';
import { useAppTheme, type AppColors } from '../src/context/ThemeContext';

interface DocumentCardProps {
  document: Document;
  onDelete: (document: Document) => void;
  onPress?: (document: Document) => void;
}

const getFileIcon = (fileName: string): string => {
  const extension = fileName?.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf':
      return 'document-text';
    case 'doc':
    case 'docx':
      return 'document';
    case 'txt':
      return 'document-text-outline';
    default:
      return 'document-outline';
  }
};

const getFileIconColor = (fileName: string): string => {
  const extension = fileName?.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf':
      return '#EF4444';
    case 'doc':
    case 'docx':
      return '#3B82F6';
    case 'txt':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function DocumentCard({
  document,
  onDelete,
  onPress,
}: DocumentCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const fileName = document.title;
  const iconName = getFileIcon(fileName) as keyof typeof Ionicons.glyphMap;
  const iconColor = getFileIconColor(fileName);
  const formattedSize = formatFileSize(0);
  const formattedDate = formatDate(document.created_at);

  const handleDelete = () => {
    console.log('🗑️ Delete icon pressed for document:', {
      id: document.id,
      title: document.title,
      path: document.path,
    });

    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log(' Delete cancelled'),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Delete confirmed for document:', document.id);
            onDelete(document);
          },
        },
      ],
    );
  };

  const handlePress = () => {
    console.log(' DocumentCard pressed:', document.id);
    if (onPress) {
      onPress(document);
    }
  };

  const getFileType = () => {
    const extension = fileName?.split('.').pop()?.toUpperCase() || '';
    return extension || 'FILE';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}
      >
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="middle">
          {fileName}
        </Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>{formattedSize}</Text>
          <Text style={styles.metadataDot}>•</Text>
          <Text style={styles.metadataText}>{formattedDate}</Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{getFileType()}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    content: {
      flex: 1,
      marginRight: 10,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    metadataText: {
      fontSize: 12,
      color: c.textTertiary,
    },
    metadataDot: {
      fontSize: 12,
      color: c.textTertiary,
      marginHorizontal: 6,
    },
    typeTag: {
      alignSelf: 'flex-start',
      backgroundColor: c.surfaceSecondary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    typeText: {
      fontSize: 11,
      color: c.textSecondary,
      fontWeight: '500',
    },
    deleteButton: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: '#FEF2F2',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
