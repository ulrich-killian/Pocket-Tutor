import React, { useRef, useEffect, useMemo, useState as UseState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/hooks/useChat';
import { useAuth } from '../../src/hooks/useAuth';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import AIThinking from '../../components/chat/AIThinking';
import type { ChatMessage } from '../../src/types/chat.types';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';
import { documentService } from '../../src/services/document.service';
import syllabusService from '../../src/services/syllabus.service';
import chatSessionService from '../../src/services/chat-session.service';

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const documentId = params.documentId as string;
  const sessionId = params.sessionId as string | undefined;
  const isFreeChat = !documentId;
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const userId = user?.id;
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Fetch user syllabus context
  const [syllabusContext, setSyllabusContext] = UseState<{
    educationLevel?: { name: string };
    stream?: { name: string; subjects?: { name: string }[] };
  } | null>(null);

  useEffect(() => {
    if (userId && isFreeChat) {
      syllabusService
        .getUserSyllabus(userId)
        .then((data) => {
          if (data?.educationLevel || data?.stream) {
            setSyllabusContext(data);
          }
        })
        .catch(() => {});
    }
  }, [userId, isFreeChat]);

  const documentTitle =
    (params.title as string) || (documentId ? 'Document' : 'Free Chat');

  // With this:
  if (!userId) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.surface}
        />
        <View style={styles.errorIconContainer}>
          <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        </View>
        <Text style={styles.errorTitle}>Sign In Required</Text>
        <Text style={styles.errorText}>Please sign in to start chatting</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages, send, loading, error } = useChat(userId, documentId);

  const handleSend = async (text: string, image?: string): Promise<void> => {
    if (!text.trim() && !image) return;
    await send(text, image);

    if (sessionId && userId) {
      chatSessionService.addMessage(sessionId, 'user', text).catch(() => {});
      setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant') {
          chatSessionService
            .addMessage(sessionId, 'assistant', lastMessage.content)
            .catch(() => {});
          chatSessionService
            .updateSession(sessionId, lastMessage.content, messages.length + 1)
            .catch(() => {});
        }
      }, 500);
    }

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({
    item,
  }: ListRenderItemInfo<ChatMessage>): React.JSX.Element => (
    <ChatBubble message={item} />
  );

  const keyExtractor = (item: ChatMessage): string => item.id;

  const isNewChat = messages.length === 0;

  // ... inside ChatScreen component ...

  const processUpload = async (asset: any) => {
    try {
      const file = {
        uri: asset.uri,
        name: asset.name || `upload_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };

      const title = asset.name || 'Chat Attachment';

      console.log('Using documentService to upload...');

      // 3. Call your existing service
      const response = await documentService.uploadDocument(
        userId,
        file,
        title,
      );

      if (response && response.data?.id) {
        router.setParams({
          documentId: response.data.id,
          title: file.name,
        });

        Alert.alert('Success', 'File processed!');

        // Small delay to let the hook pick up the new documentId param
        setTimeout(() => {
          handleSend(
            "I've uploaded this file. What can you tell me about the text inside?",
          );
        }, 500);
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message);
    }
  };

  const handleCameraPress = async () => {
    Keyboard.dismiss();
    setTimeout(() => {
      Alert.alert('Upload Notes', 'Choose source:', [
        {
          text: 'Camera',
          onPress: async () => {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status === 'granted') {
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
              });
              if (!result.canceled) processUpload(result.assets[0]);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status === 'granted') {
              const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 0.7,
              });
              if (!result.canceled) processUpload(result.assets[0]);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }, 100);
  };

  const handleFilePress = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    });
    if (!result.canceled) processUpload(result.assets[0]);
  };

  // ... rest of the component ...

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerLogoCircle}>
              <Text style={styles.headerLogoText}>PT</Text>
            </View>
            <Text style={styles.headerTitle}>AI Tutor</Text>
          </View>

          {/* UPDATE THIS LINE BELOW */}
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {syllabusContext?.educationLevel?.name &&
            syllabusContext?.stream?.name
              ? `${syllabusContext.educationLevel.name} • ${syllabusContext.stream.name}`
              : !documentId
                ? 'Your Personal Academic Mentor'
                : documentTitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                clearMessages();
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Clear Chat</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname: '/(protected)/documents',
                } as any);
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.text}
              />
              <Text style={styles.menuItemText}>View Documents</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Messages List */}
      <FlatList<ChatMessage>
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.list, isNewChat && styles.listEmpty]}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name={isFreeChat ? 'sparkles-outline' : 'chatbubbles-outline'}
                size={48}
                color="#6366F1"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {isFreeChat ? "Hi, I'm Pocket Tutor!" : 'Start Learning'}
            </Text>
            <Text style={styles.emptyText}>
              {isFreeChat
                ? "I'm your academic mentor. Ask me anything about school, life, or career—no documents needed!"
                : 'Ask me anything about your document. I can help you understand concepts, summarize content, or answer questions.'}
            </Text>

            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              <View style={styles.suggestionsList}>
                {isFreeChat ? (
                  <>
                    <TouchableOpacity
                      onPress={() =>
                        handleSend(
                          'Explain how the ecosystem works in Cameroon',
                        )
                      }
                    >
                      <View style={styles.suggestionChip}>
                        <Text style={styles.suggestionText}>
                          Ecosystems in Cameroon
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleSend('Give me a study plan for my exams')
                      }
                    >
                      <View style={styles.suggestionChip}>
                        <Text style={styles.suggestionText}>
                          Create a study plan
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleSend('Summarize this document')}
                    >
                      <View style={styles.suggestionChip}>
                        <Text style={styles.suggestionText}>
                          Summarize notes
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleSend('Explain key concepts')}
                    >
                      <View style={styles.suggestionChip}>
                        <Text style={styles.suggestionText}>
                          Explain concepts
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        }
      />

      {/* AI Thinking indicator */}
      {loading ? <AIThinking visible={true} /> : null}

      {/* Error message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color="#EF4444" />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => send('')}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onCameraPress={handleCameraPress}
        onFilePress={handleFilePress}
        disabled={loading}
      />
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 50 : 40,
      paddingBottom: 12,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerLogoCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#1E3A8A',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerLogoText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: c.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    list: {
      paddingHorizontal: 8,
      paddingVertical: 16,
      flexGrow: 1,
    },
    listEmpty: {
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 40,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    suggestionsContainer: {
      width: '100%',
    },
    suggestionsTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textTertiary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    suggestionsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    suggestionChip: {
      backgroundColor: c.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    suggestionText: {
      fontSize: 13,
      color: '#4F46E5',
    },
    loadingContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    loadingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      alignSelf: 'flex-start',
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    loadingText: {
      fontSize: 13,
      color: c.textSecondary,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    errorBannerText: {
      flex: 1,
      fontSize: 13,
      color: '#DC2626',
    },
    retryText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#EF4444',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: c.background,
    },
    errorIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 15,
      color: c.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    errorButton: {
      backgroundColor: '#4F46E5',
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    errorButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: Platform.OS === 'ios' ? 100 : 90,
      paddingRight: 16,
    },
    menuContainer: {
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingVertical: 4,
      minWidth: 180,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    menuItemText: {
      fontSize: 15,
      color: c.text,
    },
    menuDivider: {
      height: 1,
      backgroundColor: c.border,
      marginHorizontal: 12,
    },
  });
function uploadDocument(arg0: ImagePicker.ImagePickerAsset) {
  throw new Error('Function not implemented.');
}
