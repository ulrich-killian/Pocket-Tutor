import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Pocket Tutor!</Text>
      <Text style={styles.subtitle}>
        {user?.email ? `Logged in as: ${user.email}` : 'Home'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
