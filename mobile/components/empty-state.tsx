import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  mascotUri?: string;
}

export function EmptyState({
  title,
  subtitle,
  mascotUri,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {mascotUri && (
        <Image
          source={{ uri: mascotUri }}
          className="h-40 w-40 mb-6"
          contentFit="contain"
        />
      )}
      <Text className="text-xl font-bold text-text dark:text-text-dark text-center mb-2">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-text-muted dark:text-text-dark-muted text-center">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
