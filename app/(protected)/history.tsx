import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  getUserHistory,
  getStudyStats,
  deleteActivity,
  clearUserHistory,
  formatDuration,
  formatDate,
  getActivityIcon,
  getActivityColor,
  type StudyActivity,
  type StudyStats,
  type StudyActivityType,
} from '../../src/services/history.service';

const { width } = Dimensions.get('window');

type FilterType = 'all' | StudyActivityType;

const filterOptions: { key: FilterType; label: string; icon?: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'flashcard', label: 'Flashcards', icon: 'albums' },
  { key: 'quiz', label: 'Quiz', icon: 'document-text' },
  { key: 'chat', label: 'Chat', icon: 'chatbubbles' },
  { key: 'document', label: 'Docs', icon: 'folder' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const c = colors;
  const styles = useMemo(() => makeStyles(c), [c]);
  const { user } = useAuth();

  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [stats, setStats] = useState<StudyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
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

  const handleDelete = (activity: StudyActivity) => {
    return null;
  };

  const handleClearAll = async () => {
    return null;
  };

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter((a) => a.type === filter);
  }, [activities, filter]);

  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: StudyActivity[] } = {};
    filteredActivities.forEach((activity) => {
      const dateKey = formatDate(activity.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [filteredActivities]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
      >
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <View style={styles.statsRow}>
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatValue}>{totalSessions}</Text>
              <Text style={styles.mainStatLabel}>Total Sessions</Text>
            </View>
            <View
              style={[
                styles.mainStatCard,
                { backgroundColor: c.primary + '15' },
              ]}
            >
              <Text style={[styles.mainStatValue, { color: c.primary }]}>
                {formatDuration(totalDuration)}
              </Text>
              <Text style={[styles.mainStatLabel, { color: c.primary }]}>
                Study Time
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterPill,
                  filter === option.key && styles.filterPillActive,
                ]}
                onPress={() => setFilter(option.key)}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon as any}
                    size={14}
                    style={[
                      styles.filterIcon,
                      filter === option.key && styles.filterIconActive,
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.filterText,
                    filter === option.key && styles.filterTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Stats Grid */}
        {stats.length > 0 && (
          <View style={styles.quickStatsContainer}>
            <Text style={styles.sectionTitle}>By Activity</Text>
            <View style={styles.quickStatsGrid}>
              {stats.map((stat) => (
                <View
                  key={stat.type}
                  style={[
                    styles.quickStatCard,
                    {
                      borderLeftColor: getActivityColor(
                        stat.type as StudyActivityType,
                      ),
                    },
                  ]}
                >
                  <View style={styles.quickStatHeader}>
                    <View
                      style={[
                        styles.quickStatIcon,
                        {
                          backgroundColor:
                            getActivityColor(stat.type as StudyActivityType) +
                            '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          getActivityIcon(stat.type as StudyActivityType) as any
                        }
                        size={16}
                        color={getActivityColor(stat.type as StudyActivityType)}
                      />
                    </View>
                    <Text style={styles.quickStatType}>
                      {stat.type === 'flashcard'
                        ? 'Flashcards'
                        : stat.type === 'document'
                          ? 'Documents'
                          : stat.type.charAt(0).toUpperCase() +
                            stat.type.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.quickStatDetails}>
                    <Text style={styles.quickStatNumber}>
                      {stat.total_sessions}
                    </Text>
                    <Text style={styles.quickStatLabelText}>sessions</Text>
                  </View>
                  {stat.avg_score !== null && (
                    <Text style={styles.quickStatScore}>
                      Avg: {Math.round(stat.avg_score)}%
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity List */}
        <View style={styles.activitySection}>
          <View style={styles.activitySectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activities.length > 0 && (
              <Text style={styles.activityCount}>
                {filteredActivities.length} items
              </Text>
            )}
          </View>

          {groupedActivities.length > 0 ? (
            groupedActivities.map(({ date, items }) => (
              <View key={date} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateText}>{date}</Text>
                </View>
                {items.map((item) => (
                  <View key={item.id} style={styles.activityCard}>
                    <View
                      style={[
                        styles.activityIconBg,
                        {
                          backgroundColor: getActivityColor(item.type) + '15',
                        },
                      ]}
                    >
                      <Ionicons
                        name={getActivityIcon(item.type) as any}
                        size={20}
                        color={getActivityColor(item.type)}
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.activityMetaRow}>
                        <View style={styles.activityBadge}>
                          <Ionicons
                            name={getActivityIcon(item.type) as any}
                            size={10}
                            color={getActivityColor(item.type)}
                          />
                          <Text
                            style={[
                              styles.activityBadgeText,
                              { color: getActivityColor(item.type) },
                            ]}
                          >
                            {item.type}
                          </Text>
                        </View>
                        {item.duration ? (
                          <View style={styles.activityDuration}>
                            <Ionicons
                              name="time-outline"
                              size={10}
                              color={c.textTertiary}
                            />
                            <Text style={styles.activityDurationText}>
                              {formatDuration(item.duration)}
                            </Text>
                          </View>
                        ) : null}
                        {item.score !== undefined ? (
                          <View
                            style={[
                              styles.activityScore,
                              {
                                backgroundColor:
                                  item.score >= 70
                                    ? '#10B98120'
                                    : item.score >= 50
                                      ? '#F59E0B20'
                                      : '#EF444420',
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
                        ) : null}
                      </View>
                      {item.description && (
                        <Text style={styles.activityDesc} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="journal-outline"
                  size={32}
                  color={c.textTertiary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start studying to see your history here
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/study')}
              >
                <Ionicons name="school-outline" size={18} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Go to Study</Text>
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
    headerStats: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    mainStatCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    },
    mainStatValue: {
      fontSize: 28,
      fontWeight: '700',
      color: c.text,
    },
    mainStatLabel: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 4,
    },
    filterContainer: {
      marginTop: 16,
    },
    filterContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.surface,
      marginRight: 8,
      gap: 6,
    },
    filterPillActive: {
      backgroundColor: c.primary,
    },
    filterIcon: {
      color: c.textSecondary,
    },
    filterIconActive: {
      color: '#FFFFFF',
    },
    filterText: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textSecondary,
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    quickStatsContainer: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    quickStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    quickStatCard: {
      width: (width - 42) / 2,
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 3,
    },
    quickStatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    quickStatIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickStatType: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    quickStatDetails: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    quickStatNumber: {
      fontSize: 22,
      fontWeight: '700',
      color: c.text,
    },
    quickStatLabelText: {
      fontSize: 12,
      color: c.textSecondary,
    },
    quickStatScore: {
      fontSize: 11,
      color: c.primary,
      fontWeight: '600',
      marginTop: 4,
    },
    activitySection: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 32,
    },
    activitySectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    activityCount: {
      fontSize: 13,
      color: c.textSecondary,
    },
    dateGroup: {
      marginBottom: 16,
    },
    dateHeader: {
      marginBottom: 8,
    },
    dateText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    activityCard: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    activityIconBg: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    activityInfo: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    activityMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    activityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
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
    activityDesc: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
