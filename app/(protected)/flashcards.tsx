import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

export default function FlashcardsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards</Text>
      <Text style={styles.subtitle}>Create and study flashcards</Text>
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: c.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: c.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: c.textSecondary,
    },
  });
