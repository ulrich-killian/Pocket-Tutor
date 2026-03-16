import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthState } from '../src/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthState();

  // If already authenticated, redirect to protected area
  if (initialized && isAuthenticated) {
    router.replace('/dashboard');
    return null;
  }

  const features = [
    {
      icon: '📚',
      title: 'AI-Powered Tutoring',
      description: 'Get instant help from our AI tutor for any subject',
    },
    {
      icon: '🃏',
      title: 'Smart Flashcards',
      description: 'Create and study flashcards powered by AI',
    },
    {
      icon: '📝',
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with AI-generated quizzes',
    },
    {
      icon: '📄',
      title: 'Document Analysis',
      description: 'Upload and learn from your study materials',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Pocket Tutor</Text>
        </View>

        {/* Hero Section with Image Background */}
        <View style={styles.heroContainer}>
          <View style={styles.heroBackground}>
            <View style={styles.gradientOverlay} />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Learn Smarter,{'\n'}Not Harder</Text>
            <Text style={styles.heroSubtitle}>
              Your AI-powered learning companion that helps you achieve your
              academic goals faster
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Get Started Free</Text>
            </TouchableOpacity>
            <Text style={styles.heroNote}>No credit card required</Text>
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🎯</Text>
            <Text style={styles.badgeText}>98% Success Rate</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⚡</Text>
            <Text style={styles.badgeText}>Instant Answers</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🔒</Text>
            <Text style={styles.badgeText}>Secure & Private</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <Text style={styles.sectionTitle}>What You Can Do</Text>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{feature.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Ready to Start Learning?</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Get Started Now</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <Text style={styles.secondaryText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.secondaryLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Pocket Tutor. Powered by AI.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: -0.5,
  },
  heroContainer: {
    position: 'relative',
    height: 340,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4F46E5',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4338CA',
    opacity: 0.3,
  },
  heroContent: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '700',
  },
  heroNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  badge: {
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  features: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cta: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  secondaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  secondaryLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '700',
    marginLeft: 4,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
