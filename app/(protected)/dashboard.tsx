import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Dashboard() {
  const router = useRouter();

  // Navbar Icons
  const Navbar = () => (
    <View style={styles.navbar}>
      <View style={styles.logoContainer}>
        <FontAwesome5 name="graduation-cap" size={24} color="#1E3A8A" />
        <Text style={styles.logoText}>PocketTutor</Text>
      </View>
      <View style={styles.navbarIcons}>
        <TouchableOpacity style={styles.navbarIcon}>
          <Ionicons name="language" size={22} color="#1E3A8A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navbarIcon}>
          <Ionicons name="notifications-outline" size={22} color="#1E3A8A" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navbarProfileButton}>
          <Ionicons name="person" size={20} color="#1E3A8A" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const features = [
    {
      id: '1',
      icon: 'chatbubbles' as keyof typeof Ionicons.glyphMap,
      title: 'AI Chat',
      description: 'Chat with your AI tutor',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      route: '/chat',
    },
    {
      id: '2',
      icon: 'albums' as keyof typeof Ionicons.glyphMap,
      title: 'Flashcards',
      description: 'Create & study cards',
      color: '#10B981',
      bgColor: '#ECFDF5',
      route: '/flashcards',
    },
    {
      id: '3',
      icon: 'document-text' as keyof typeof Ionicons.glyphMap,
      title: 'Quiz',
      description: 'Test your knowledge',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      route: '/quiz',
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
      <Navbar />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning 👋</Text>
              <Text style={styles.userName}>Welcome back!</Text>
            </View>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Ready to learn?</Text>
            <Text style={styles.welcomeSubtitle}>
              Continue where you left off
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/chat' as any)}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeIcon}>
            <FontAwesome5 name="graduation-cap" size={50} color="#FFFFFF" />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {quickActions.map((action) => (
              <View key={action.id} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: action.color + '15' },
                  ]}
                >
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.statValue}>{action.value}</Text>
                <Text style={styles.statLabel}>{action.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Learning Paths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Paths</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  navbarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navbarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  navbarProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
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
    backgroundColor: '#1E3A8A',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 16,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginRight: 8,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
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
