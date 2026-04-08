import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface StudyFeature {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  route: string;
}

const studyFeatures: StudyFeature[] = [
  {
    id: 'ai-tutor',
    title: 'AI Tutor',
    subtitle: 'Chat with AI helper',
    icon: 'chatbubbles',
    iconColor: 'black',
    bgColor: '#EEF2FF',
    route: '/chat',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    subtitle: 'Create & study',
    icon: 'albums',
    iconColor: '#10B981',
    bgColor: '#ECFDF5',
    route: '/flashcards',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    subtitle: 'Test your knowledge',
    icon: 'document-text',
    iconColor: '#F59E0B',
    bgColor: '#FFFBEB',
    route: '/quiz',
  },
  {
    id: 'documents',
    title: 'Documents',
    subtitle: 'Manage files',
    icon: 'folder',
    iconColor: '#EC4899',
    bgColor: '#FDF2F8',
    route: '/documents',
  },
  {
    id: 'history',
    title: 'History',
    subtitle: 'Past sessions',
    icon: 'time',
    iconColor: '#8B5CF6',
    bgColor: '#F5F3FF',
    route: '/documents',
  },
  {
    id: 'sessions',
    title: 'Study Sessions',
    subtitle: 'All modes',
    icon: 'play-circle',
    iconColor: '#06B6D4',
    bgColor: '#ECFEFF',
    route: '/chat',
  },
  {
    id: 'progress',
    title: 'Progress',
    subtitle: 'Track your growth',
    icon: 'trending-up',
    iconColor: '#84CC16',
    bgColor: '#F7FEE7',
    route: '/documents',
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks',
    subtitle: 'Saved items',
    icon: 'bookmark',
    iconColor: '#F97316',
    bgColor: '#FFF7ED',
    route: '/documents',
  },
];

export default function StudyPage() {
  const router = useRouter();

  const handleFeaturePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Study</Text>
          <Text style={styles.headerSubtitle}>
            Access all your learning tools
          </Text>
        </View>

        {/* Study Features Grid */}
        <View style={styles.featuresGrid}>
          {studyFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature.route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: feature.bgColor },
                ]}
              >
                <Ionicons
                  name={feature.icon}
                  size={28}
                  color={feature.iconColor}
                />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/upload')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="cloud-upload" size={24} color="#3B82F6" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Upload Materials</Text>
              <Text style={styles.quickActionSubtitle}>
                Add new study documents
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Study Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Study Tip</Text>
            <Text style={styles.tipText}>
              Consistent practice leads to better retention. Try studying for 15
              minutes every day!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  featureCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 18,
  },
});
