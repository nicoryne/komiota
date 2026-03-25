import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/15',
  success: 'bg-status-success/20',
  warning: 'bg-status-warning/20',
  error: 'bg-status-error/20',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-primary',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-error',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View className={`self-start rounded-pill px-3 py-1 ${variantStyles[variant]}`}>
      <Text className={`text-xs font-semibold ${variantTextStyles[variant]}`}>
        {label}
      </Text>
    </View>
  );
}
