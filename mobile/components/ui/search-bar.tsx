import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface SearchBarProps {
  onPress?: () => void;
  placeholder?: string;
}

export function SearchBar({
  onPress,
  placeholder = 'Where are you going?',
}: SearchBarProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-surface dark:bg-surface-dark rounded-pill px-5 py-3.5 shadow-lg shadow-primary/10 active:opacity-90"
    >
      <Ionicons name="search" size={20} color={colors.primary.DEFAULT} />
      <Text className="text-text-muted dark:text-text-dark-muted text-base ml-3 flex-1">
        {placeholder}
      </Text>
      <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
        <Ionicons name="arrow-forward" size={16} color={colors.surface.DEFAULT} />
      </View>
    </Pressable>
  );
}
