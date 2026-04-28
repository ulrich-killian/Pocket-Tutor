import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

interface SourceListProps {
  sources: string[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sources</Text>
      {sources.map((source, index) => (
        <Text key={index} style={styles.chip}>
          📄 {source}
        </Text>
      ))}
    </View>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 6,
    },
    label: {
      fontSize: 11,
      color: c.textSecondary,
      marginBottom: 4,
      fontWeight: '600',
    },
    chip: { fontSize: 11, color: c.primary, marginBottom: 2 },
  });

export default SourceList;
