import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  getUserHistory,
  getStudyStats,
  formatDuration,
  formatDate,
  type StudyActivity,
  type StudyStats,
  type StudyActivityType,
} from '../../src/services/history.service';

const { width } = Dimensions.get('window');

const activityColors: Record<StudyActivityType, string> = {
  flashcard: '#10B981',
  quiz: '#F59E0B',
  chat: '#3B82F6',
  document: '#EC4899',
};

const activityIcons: Record<StudyActivityType, string> = {
  flashcard: 'albums',
  chat: 'chatbubbles',
  document: 'folder',
  quiz: 'document-text',
};

export default function StudyPage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const c = colors;
  const styles = useMemo(() => makeStyles(c), [c]);
  const { user } = useAuth();

  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [stats, setStats] = useState<StudyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const [historyData, statsData] = await Promise.all([
        getUserHistory(user.id, 50),
        getStudyStats(user.id),
      ]);
      setActivities(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalSessions = useMemo(() => {
    return stats.reduce((sum, s) => sum + Number(s.total_sessions), 0);
  }, [stats]);

  const totalDuration = useMemo(() => {
    return stats.reduce((sum, s) => sum + (Number(s.total_duration) || 0), 0);
  }, [stats]);

  const avgScore = useMemo(() => {
    const scores = stats.filter((s) => s.avg_score !== null);
    if (scores.length === 0) return 0;
    return Math.round(
      scores.reduce((sum, s) => sum + (s.avg_score || 0), 0) / scores.length,
    );
  }, [stats]);

  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: StudyActivity[] } = {};
    activities.forEach((activity) => {
      const dateKey = formatDate(activity.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [activities]);

  const handleActivityPress = (activity: StudyActivity) => {
    if (activity.type === 'flashcard') {
      router.push('/flashcards');
    } else if (activity.type === 'quiz') {
      router.push('/quiz');
    } else if (activity.type === 'chat') {
      router.push('/chat');
    } else if (activity.type === 'document') {
      router.push('/documents');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Study History',
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={c.primary}
          />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="play" size={18} color="#4F46E5" />
            </View>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="time" size={18} color="#10B981" />
            </View>
            <Text style={styles.statValue}>
              {totalDuration ? formatDuration(totalDuration) : '0m'}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="star" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>
              {avgScore ? `${avgScore}%` : '-'}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Activity Breakdown */}
        {stats.length > 0 && (
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>By Activity</Text>
            <View style={styles.breakdownGrid}>
              {stats.map((stat) => (
                <TouchableOpacity
                  key={stat.type}
                  style={styles.breakdownCard}
                  onPress={() => {
                    if (stat.type === 'flashcard') router.push('/flashcards');
                    else if (stat.type === 'quiz') router.push('/quiz');
                    else if (stat.type === 'chat') router.push('/chat');
                    else if (stat.type === 'document')
                      router.push('/documents');
                  }}
                >
                  <View
                    style={[
                      styles.breakdownIcon,
                      {
                        backgroundColor:
                          activityColors[stat.type as StudyActivityType] + '20',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        activityIcons[stat.type as StudyActivityType] as any
                      }
                      size={18}
                      color={activityColors[stat.type as StudyActivityType]}
                    />
                  </View>
                  <View style={styles.breakdownInfo}>
                    <Text style={styles.breakdownTitle}>
                      {stat.type === 'flashcard'
                        ? 'Flashcards'
                        : stat.type === 'document'
                          ? 'Documents'
                          : stat.type.charAt(0).toUpperCase() +
                            stat.type.slice(1)}
                    </Text>
                    <Text style={styles.breakdownCount}>
                      {stat.total_sessions} sessions
                    </Text>
                  </View>
                  {stat.avg_score !== null && (
                    <View
                      style={[
                        styles.breakdownScore,
                        {
                          backgroundColor:
                            activityColors[stat.type as StudyActivityType] +
                            '15',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.breakdownScoreText,
                          {
                            color:
                              activityColors[stat.type as StudyActivityType],
                          },
                        ]}
                      >
                        {Math.round(stat.avg_score)}%
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Activity List */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {groupedActivities.length > 0 ? (
            groupedActivities.map(({ date, items }) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.activityCard}
                    onPress={() => handleActivityPress(item)}
                  >
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: activityColors[item.type] + '15' },
                      ]}
                    >
                      <Ionicons
                        name={activityIcons[item.type] as any}
                        size={20}
                        color={activityColors[item.type]}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.activityMeta}>
                        <View
                          style={[
                            styles.activityBadge,
                            {
                              backgroundColor: activityColors[item.type] + '15',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activityBadgeText,
                              { color: activityColors[item.type] },
                            ]}
                          >
                            {item.type}
                          </Text>
                        </View>
                        {item.duration && (
                          <View style={styles.activityDuration}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color={c.textTertiary}
                            />
                            <Text style={styles.activityDurationText}>
                              {formatDuration(item.duration)}
                            </Text>
                          </View>
                        )}
                        {item.score !== undefined && (
                          <View
                            style={[
                              styles.activityScore,
                              {
                                backgroundColor:
                                  item.score >= 70
                                    ? '#10B98115'
                                    : item.score >= 50
                                      ? '#F59E0B15'
                                      : '#EF444415',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.activityScoreText,
                                {
                                  color:
                                    item.score >= 70
                                      ? '#10B981'
                                      : item.score >= 50
                                        ? '#F59E0B'
                                        : '#EF4444',
                                },
                              ]}
                            >
                              {item.score}%
                            </Text>
                          </View>
                        )}
                      </View>
                      {item.description && (
                        <Text
                          style={styles.activityDescription}
                          numberOfLines={1}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={c.textTertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="journal-outline"
                  size={32}
                  color={c.textTertiary}
                />
              </View>
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start a study session to see your history
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/flashcards')}
              >
                <Text style={styles.emptyButtonText}>Start Studying</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
    },
    statIconBg: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    statLabel: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    breakdownSection: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    breakdownGrid: {
      gap: 8,
    },
    breakdownCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    breakdownIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    breakdownInfo: {
      flex: 1,
    },
    breakdownTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    breakdownCount: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    breakdownScore: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    breakdownScoreText: {
      fontSize: 13,
      fontWeight: '600',
    },
    activitySection: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    dateGroup: {
      marginBottom: 16,
    },
    dateHeader: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: 8,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    activityIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    activityMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    activityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    activityBadgeText: {
      fontSize: 11,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    activityDuration: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    activityDurationText: {
      fontSize: 11,
      color: c.textTertiary,
    },
    activityScore: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    activityScoreText: {
      fontSize: 11,
      fontWeight: '600',
    },
    activityDescription: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 20,
    },
    emptyButton: {
      backgroundColor: c.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
