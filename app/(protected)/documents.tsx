import React, { useState, useEffect, useCallback } from 'react';
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

export default function DocumentsScreen() {
  const router = useRouter();
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

    router.push({
      pathname: '/chat',
      params: { documentId: document.id },
    });
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
          <ActivityIndicator size="large" color="#1E3A8A" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
