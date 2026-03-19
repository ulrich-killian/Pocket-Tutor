import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document, documentService } from '../src/services/documentService';

interface DocumentCardProps {
  document: Document;
  onDelete: (document: Document) => void;
  onPress?: (document: Document) => void;
}

export default function DocumentCard({
  document,
  onDelete,
  onPress,
}: DocumentCardProps) {
  const iconName = documentService.getFileIcon(
    document.name,
  ) as keyof typeof Ionicons.glyphMap;
  const iconColor = documentService.getFileIconColor(document.name);
  const formattedSize = documentService.formatFileSize(document.size);
  const formattedDate = documentService.formatDate(document.createdAt);

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(document),
        },
      ],
    );
  };

  const handlePress = () => {
    if (onPress) {
      onPress(document);
    }
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
          {document.name}
        </Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>{formattedSize}</Text>
          <Text style={styles.metadataDot}>•</Text>
          <Text style={styles.metadataText}>{formattedDate}</Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{document.type}</Text>
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
    color: '#1F2937',
    marginBottom: 4,
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
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    color: '#6B7280',
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
