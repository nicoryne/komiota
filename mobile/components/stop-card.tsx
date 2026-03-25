import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/colors';

interface StopCardProps {
  name: string;
  distance?: string;
  status?: 'verified' | 'pending';
  onPress?: () => void;
}

export function StopCard({ name, distance, status, onPress }: StopCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-surface dark:bg-surface-dark rounded-card p-4 mb-2 active:opacity-90"
    >
      <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
        <Ionicons name="location" size={20} color={colors.primary.DEFAULT} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-text dark:text-text-dark font-semibold text-base" numberOfLines={1}>
          {name}
        </Text>
        {distance && (
          <Text className="text-text-muted dark:text-text-dark-muted text-xs mt-0.5">
            {distance} away
          </Text>
        )}
      </View>
      {status && (
        <View
          className={`px-2.5 py-1 rounded-pill ${
            status === 'verified' ? 'bg-status-success/15' : 'bg-status-warning/15'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              status === 'verified' ? 'text-status-success' : 'text-status-warning'
            }`}
          >
            {status === 'verified' ? 'Verified' : 'Pending'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
