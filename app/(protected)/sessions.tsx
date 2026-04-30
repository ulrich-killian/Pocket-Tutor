import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  chatSessionService,
  type ChatSession,
} from '../../src/services/chat-session.service';

export default function SessionsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) loadSessions();
  }, [user?.id]);

  const loadSessions = async () => {
    if (!user?.id) return;
    try {
      const data = await chatSessionService.getUserSessions(user.id);
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleDelete = async (sessionId: string) => {
    if (!user?.id) return;
    await chatSessionService.deleteSession(sessionId, user.id);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() =>
        router.push({
          pathname: '/(protected)/chat',
          params: { sessionId: item.id },
        } as any)
      }
    >
      <View style={styles.sessionIcon}>
        <Ionicons name="chatbubbles-outline" size={22} color="#6366F1" />
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.lastMessage ? (
          <Text style={styles.sessionPreview} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        ) : null}
        <View style={styles.sessionMeta}>
          {item.subject ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.subject}</Text>
            </View>
          ) : null}
          <Text style={styles.sessionDate}>{formatDate(item.updatedAt)}</Text>
          <Text style={styles.sessionCount}>{item.messageCount} messages</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Chat History',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(protected)/chat' as any)}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="add" size={24} color="#6366F1" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          sessions.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyTitle}>No chats yet</Text>
              <Text style={styles.emptySubtitle}>
                Start a new conversation with your tutor
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/(protected)/chat' as any)}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>New Chat</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    list: { padding: 16, gap: 12 },
    emptyContainer: { flex: 1 },
    sessionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 14,
      gap: 12,
      marginBottom: 10,
    },
    sessionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#6366F115',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sessionInfo: { flex: 1 },
    sessionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      marginBottom: 3,
    },
    sessionPreview: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 6,
    },
    sessionMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    badge: {
      backgroundColor: '#6366F115',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeText: { fontSize: 11, color: '#6366F1', fontWeight: '600' },
    sessionDate: { fontSize: 11, color: c.textTertiary },
    sessionCount: { fontSize: 11, color: c.textTertiary },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.text,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366F1',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      marginTop: 16,
    },
    emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  });
