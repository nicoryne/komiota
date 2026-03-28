import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-12 w-12', text: 'text-base' },
  lg: { container: 'h-20 w-20', text: 'text-2xl' },
};

const exactSizes = {
  sm: 32,
  md: 48,
  lg: 80,
};

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const { container, text: textSize } = sizeMap[size];

  const dimension = exactSizes[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      className={`${container} rounded-full bg-primary/15 items-center justify-center`}
    >
      <Text className={`${textSize} font-bold text-primary`}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
