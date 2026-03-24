import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SourceListProps {
  sources: string[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => (
  <View style={styles.container}>
    <Text style={styles.label}>Sources</Text>
    {sources.map((source, index) => (
      <Text key={index} style={styles.chip}>
        📄 {source}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
  label: { fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  chip: { fontSize: 11, color: '#4F46E5', marginBottom: 2 },
});

export default SourceList;
