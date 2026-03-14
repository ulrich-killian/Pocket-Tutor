import { View, Text, StyleSheet } from 'react-native';

export default function FlashcardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards</Text>
      <Text style={styles.subtitle}>Create and study flashcards</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
