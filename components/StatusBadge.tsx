import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

interface StatusBadgeProps {
  status: DocumentStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const statusConfig: Record<
  DocumentStatus,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
    label: string;
    showSpinner: boolean;
  }
> = {
  uploading: {
    icon: 'cloud-upload',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    label: 'Uploading...',
    showSpinner: true,
  },
  processing: {
    icon: 'cog',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    label: 'Processing...',
    showSpinner: true,
  },
  ready: {
    icon: 'checkmark-circle',
    color: '#10B981',
    bgColor: '#ECFDF5',
    label: 'Ready',
    showSpinner: false,
  },
  error: {
    icon: 'alert-circle',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    label: 'Error',
    showSpinner: false,
  },
};

const sizeConfig = {
  small: { iconSize: 12, fontSize: 10, padding: 4, gap: 4 },
  medium: { iconSize: 14, fontSize: 12, padding: 6, gap: 6 },
  large: { iconSize: 18, fontSize: 14, padding: 8, gap: 8 },
};

export default function StatusBadge({
  status,
  size = 'medium',
  showLabel = true,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: sizes.padding + 2,
          paddingVertical: sizes.padding,
          gap: sizes.gap,
        },
      ]}
    >
      {config.showSpinner ? (
        <ActivityIndicator size="small" color={config.color} />
      ) : (
        <Ionicons
          name={config.icon}
          size={sizes.iconSize}
          color={config.color}
        />
      )}
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: config.color, fontSize: sizes.fontSize },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '500',
  },
});
