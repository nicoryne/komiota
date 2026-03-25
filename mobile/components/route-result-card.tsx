import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/colors';

interface RouteResultCardProps {
  routeName: string;
  originStop: string;
  destinationStop: string;
  walkDistance?: string;
  eta?: string;
  multiplier?: number;
  onPress?: () => void;
}

export function RouteResultCard({
  routeName,
  originStop,
  destinationStop,
  walkDistance,
  eta,
  multiplier,
  onPress,
}: RouteResultCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface dark:bg-surface-dark rounded-card p-4 mb-3 shadow-sm shadow-primary/5 active:opacity-90"
    >
      {/* Route header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary rounded-xl items-center justify-center mr-2.5">
            <Ionicons name="bus" size={16} color={colors.surface.DEFAULT} />
          </View>
          <Text className="text-text dark:text-text-dark font-bold text-base">
            {routeName}
          </Text>
        </View>
        {multiplier && multiplier > 1 && (
          <View className="bg-status-success/15 px-2.5 py-1 rounded-pill">
            <Text className="text-status-success text-xs font-bold">{multiplier}x pts</Text>
          </View>
        )}
      </View>

      {/* Origin → Destination */}
      <View className="ml-1 mb-3">
        <View className="flex-row items-center mb-2">
          <View className="w-2.5 h-2.5 rounded-full bg-primary mr-3" />
          <Text className="text-text dark:text-text-dark text-sm flex-1" numberOfLines={1}>
            {originStop}
          </Text>
        </View>
        <View className="w-0.5 h-4 bg-primary/20 ml-1 mb-1" />
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-status-success mr-3" />
          <Text className="text-text dark:text-text-dark text-sm flex-1" numberOfLines={1}>
            {destinationStop}
          </Text>
        </View>
      </View>

      {/* Footer info */}
      <View className="flex-row items-center justify-between pt-2 border-t border-primary/10">
        {walkDistance && (
          <View className="flex-row items-center">
            <Ionicons name="walk" size={14} color={colors.text.muted} />
            <Text className="text-text-muted dark:text-text-dark-muted text-xs ml-1">{walkDistance} walk</Text>
          </View>
        )}
        {eta && (
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color={colors.text.muted} />
            <Text className="text-text-muted dark:text-text-dark-muted text-xs ml-1">{eta}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
