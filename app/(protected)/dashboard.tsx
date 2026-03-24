import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Bottom Tab Navigation
  const [activeTab, setActiveTab] = React.useState('home');

  const tabs = [
    {
      id: 'home',
      name: 'Home',
      icon: 'home' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'home' as keyof typeof Ionicons.glyphMap,
      route: '/dashboard',
    },
    {
      id: 'study',
      name: 'Study',
      icon: 'book-outline' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'book' as keyof typeof Ionicons.glyphMap,
      route: '/chat',
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      icon: 'albums-outline' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'albums' as keyof typeof Ionicons.glyphMap,
      route: '/flashcards',
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'person' as keyof typeof Ionicons.glyphMap,
      route: '/profile',
    },
  ];

  const handleTabPress = (tab: (typeof tabs)[0]) => {
    setActiveTab(tab.id);
    if (tab.route !== '/dashboard') {
      router.push(tab.route as any);
    }
  };

  // Bottom Tab Bar
  const BottomTabBar = () => (
    <View style={styles.bottomTabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.activeIcon : tab.icon}
            size={24}
            color={activeTab === tab.id ? '#1E3A8A' : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? '#1E3A8A' : '#9CA3AF' },
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const features = [
    {
      id: '1',
      icon: 'cloud-upload' as keyof typeof Ionicons.glyphMap,
      title: 'Upload',
      description: 'Upload study materials',
      color: '#EC4899',
      bgColor: '#FDF2F8',
      route: '/upload',
    },
    {
      id: '2',
      icon: 'chatbubbles' as keyof typeof Ionicons.glyphMap,
      title: 'AI Chat',
      description: 'Chat with your AI tutor',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      route: '/chat',
    },
    {
      id: '3',
      icon: 'albums' as keyof typeof Ionicons.glyphMap,
      title: 'Flashcards',
      description: 'Create & study cards',
      color: '#10B981',
      bgColor: '#ECFDF5',
      route: '/flashcards',
    },
    {
      id: '4',
      icon: 'document-text' as keyof typeof Ionicons.glyphMap,
      title: 'Quiz',
      description: 'Test your knowledge',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      route: '/quiz',
    },
    {
      id: '5',
      icon: 'folder' as keyof typeof Ionicons.glyphMap,
      title: 'Documents',
      description: 'View your files',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      route: '/documents',
    },
  ];

  // Course progress data
  const courses = [
    {
      id: '1',
      title: 'Introduction to Physics',
      progress: 65,
      lessons: '8/12 lessons',
      color: '#4F46E5',
    },
    {
      id: '2',
      title: 'Calculus Fundamentals',
      progress: 42,
      lessons: '5/12 lessons',
      color: '#10B981',
    },
    {
      id: '3',
      title: 'Chemistry Basics',
      progress: 88,
      lessons: '11/12 lessons',
      color: '#F59E0B',
    },
  ];

  const quickActions = [
    {
      id: '1',
      icon: 'book' as keyof typeof Ionicons.glyphMap,
      label: 'Flashcards',
      value: '12',
      color: '#10B981',
    },
    {
      id: '2',
      icon: 'document' as keyof typeof Ionicons.glyphMap,
      label: 'Quizzes',
      value: '5',
      color: '#F59E0B',
    },
    {
      id: '3',
      icon: 'chatbubble' as keyof typeof Ionicons.glyphMap,
      label: 'Chats',
      value: '8',
      color: '#4F46E5',
    },
    {
      id: '4',
      icon: 'time' as keyof typeof Ionicons.glyphMap,
      label: 'Hours',
      value: '24',
      color: '#EC4899',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      title: 'Completed Quiz',
      subtitle: 'Science - Chapter 5',
      time: '2 hours ago',
      icon: 'document-text' as keyof typeof Ionicons.glyphMap,
      iconColor: '#F59E0B',
      iconBg: '#FFFBEB',
    },
    {
      id: '2',
      title: 'Created Flashcards',
      subtitle: 'Mathematics Formulas',
      time: 'Yesterday',
      icon: 'albums' as keyof typeof Ionicons.glyphMap,
      iconColor: '#10B981',
      iconBg: '#ECFDF5',
    },
    {
      id: '3',
      title: 'AI Chat Session',
      subtitle: 'Physics Help',
      time: '2 days ago',
      icon: 'chatbubbles' as keyof typeof Ionicons.glyphMap,
      iconColor: '#4F46E5',
      iconBg: '#EEF2FF',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>Welcome back!</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/profile' as any)}
              >
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>
              Search courses, documents...
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="style" size={18} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.headerStatLabel}>Flashcards</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: '#FFFBEB' },
                ]}
              >
                <Ionicons name="document-text" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.headerStatLabel}>Quizzes</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: '#ECFDF5' },
                ]}
              >
                <Ionicons name="time" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.statNumber}>8h</Text>
                <Text style={styles.headerStatLabel}>Study Time</Text>
              </View>
            </View>
          </View>

          {/* Streak Card */}
          <View style={styles.streakContainer}>
            <View style={styles.streakLeft}>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.streakTitle}>5 Day Streak!</Text>
                <Text style={styles.streakSubtitle}>Keep it up</Text>
              </View>
            </View>
            <View style={styles.streakProgress}>
              <View style={styles.streakDays}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <View
                    key={i}
                    style={[styles.streakDay, i < 5 && styles.streakDayActive]}
                  >
                    <Text
                      style={[
                        styles.streakDayText,
                        i < 5 && styles.streakDayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeCardOverlay} />
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeBadge}>
              <Ionicons name="sparkles" size={12} color="#1E3A8A" />
              <Text style={styles.welcomeBadgeText}>AI Powered</Text>
            </View>
            <Text style={styles.welcomeTitle}>Ready to learn?</Text>
            <Text style={styles.welcomeSubtitle}>
              Continue your learning journey where you left off
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/chat' as any)}
              activeOpacity={0.8}
            >
              <View style={styles.continueButtonContent}>
                <Text style={styles.continueButtonText}>Continue Learning</Text>
                <View style={styles.continueButtonIcon}>
                  <Ionicons name="arrow-forward" size={16} color="#1E3A8A" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeRight}>
            <View style={styles.welcomeIconContainer}>
              <FontAwesome5 name="graduation-cap" size={44} color="#FFFFFF" />
            </View>
            <View style={styles.welcomeDecoCircle1} />
            <View style={styles.welcomeDecoCircle2} />
          </View>
        </View>

        {/* Learning Paths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Courses</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.courseScroll}
          >
            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.courseHeader,
                    { backgroundColor: course.color },
                  ]}
                >
                  <FontAwesome5 name="book-open" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.courseContent}>
                  <Text style={styles.courseTitle} numberOfLines={1}>
                    {course.title}
                  </Text>
                  <Text style={styles.courseLessons}>{course.lessons}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${course.progress}%`,
                            backgroundColor: course.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{course.progress}%</Text>
                  </View>
                </View>
                <View style={styles.courseAction}>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.bgColor },
                  ]}
                >
                  <Ionicons
                    name={feature.icon}
                    size={28}
                    color={feature.color}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityCard}>
            {recentActivity.map((activity, index) => (
              <View key={activity.id}>
                <View style={styles.activityItem}>
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: activity.iconBg },
                    ]}
                  >
                    <Ionicons
                      name={activity.icon}
                      size={18}
                      color={activity.iconColor}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>
                      {activity.subtitle}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                {index < recentActivity.length - 1 && (
                  <View style={styles.activityDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Daily Tip</Text>
            <Text style={styles.tipText}>
              Consistent practice leads to better retention. Try studying for 15
              minutes every day!
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#93C5FD',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streakSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  streakProgress: {
    alignItems: 'flex-end',
  },
  streakDays: {
    flexDirection: 'row',
    gap: 6,
  },
  streakDay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayActive: {
    backgroundColor: '#F59E0B',
  },
  streakDayText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  streakDayTextActive: {
    color: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  greeting: {
    fontSize: 14,
    color: '#93C5FD',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeCard: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  welcomeCardOverlay: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  welcomeContent: {
    flex: 1.2,
    zIndex: 1,
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  welcomeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 18,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  continueButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  welcomeRight: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  welcomeIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeDecoCircle1: {
    position: 'absolute',
    top: 10,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  welcomeDecoCircle2: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  courseScroll: {
    marginTop: 8,
  },
  courseCard: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  courseHeader: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  courseContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseLessons: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 35,
  },
  courseAction: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  activityDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 19,
  },
});
