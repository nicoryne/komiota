import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  FadeOutDown,
  SlideInDown,
} from 'react-native-reanimated';
import { colors } from '@/lib/colors';
import { Button } from '@/components/ui/button';
import type { RoutePlan } from '@/hooks/use-offline-routing';

type FlowState = 'idle' | 'preview' | 'boarding' | 'transit' | 'complete';

interface RouteBottomSheetProps {
  state: FlowState;
  routePlan: RoutePlan | null;
  distanceToOrigin: number | null; // meters
  onStartJourney: () => void;
  onBoarding: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RouteBottomSheet({
  state,
  routePlan,
  distanceToOrigin,
  onStartJourney,
  onBoarding,
  onCancel,
  isLoading,
}: RouteBottomSheetProps) {
  const insets = useSafeAreaInsets();

  if (state === 'idle' || state === 'complete' || !routePlan) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(400).springify()}
      exiting={FadeOutDown.duration(300)}
      className="absolute bottom-0 left-0 right-0 bg-surface dark:bg-surface-dark rounded-t-[32px]"
      style={{
        paddingBottom: Math.max(insets.bottom, 20) + 8,
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 24,
      }}
    >
      {/* Handle */}
      <View className="items-center pt-3 pb-1">
        <View className="w-10 h-1 bg-text-muted/30 rounded-full" />
      </View>

      <View className="px-6 pt-3">
        {/* Route header */}
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-primary rounded-xl items-center justify-center mr-3">
            <Ionicons name="bus" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-text dark:text-text-dark font-bold text-base">
              {routePlan.route.name}
            </Text>
            {routePlan.route.pointMultiplier > 1 && (
              <Text className="text-status-success text-xs font-semibold">
                {routePlan.route.pointMultiplier}x points bonus
              </Text>
            )}
          </View>
          <Pressable
            onPress={onCancel}
            className="w-8 h-8 bg-text-muted/10 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={18} color={colors.text.muted} />
          </Pressable>
        </View>

        {/* Origin → Destination */}
        <View className="bg-background dark:bg-background-dark rounded-card p-4 mb-4">
          {/* Origin */}
          <View className="flex-row items-start mb-3">
            <View className="w-3 h-3 rounded-full bg-primary mt-1 mr-3" />
            <View className="flex-1">
              <Text className="text-text-muted dark:text-text-dark-muted text-xs mb-0.5">
                Walk to
              </Text>
              <Text
                className="text-text dark:text-text-dark font-semibold text-sm"
                numberOfLines={1}
              >
                {routePlan.originStop.name}
              </Text>
            </View>
            <View className="flex-row items-center bg-primary/10 px-2.5 py-1 rounded-pill">
              <Ionicons name="walk" size={12} color={colors.primary.DEFAULT} />
              <Text className="text-primary text-xs font-semibold ml-1">
                {routePlan.walkToOriginMin} min
              </Text>
            </View>
          </View>

          {/* Line connector */}
          <View className="ml-1.5 h-4 border-l-2 border-dashed border-primary/30 mb-3" />

          {/* Destination */}
          <View className="flex-row items-start">
            <View className="w-3 h-3 rounded-full bg-status-success mt-1 mr-3" />
            <View className="flex-1">
              <Text className="text-text-muted dark:text-text-dark-muted text-xs mb-0.5">
                Arrive at
              </Text>
              <Text
                className="text-text dark:text-text-dark font-semibold text-sm"
                numberOfLines={1}
              >
                {routePlan.destinationStop.name}
              </Text>
            </View>
            <View className="flex-row items-center bg-status-success/10 px-2.5 py-1 rounded-pill">
              <Ionicons name="walk" size={12} color={colors.status.success} />
              <Text className="text-status-success text-xs font-semibold ml-1">
                {routePlan.walkFromDestMin} min
              </Text>
            </View>
          </View>
        </View>

        {/* State-dependent CTA */}
        {state === 'preview' && (
          <Button
            label="Start Journey"
            onPress={onStartJourney}
            loading={isLoading}
            icon={<Ionicons name="navigate" size={18} color="#fff" />}
          />
        )}

        {state === 'boarding' && (
          <View>
            {/* Proximity indicator */}
            <View className="flex-row items-center justify-center mb-3 bg-primary/8 rounded-card py-3">
              <Ionicons name="walk" size={20} color={colors.primary.DEFAULT} />
              <Text className="text-primary font-semibold text-sm ml-2">
                {distanceToOrigin !== null
                  ? distanceToOrigin < 50
                    ? 'You\'re at the stop!'
                    : `${Math.round(distanceToOrigin)}m to stop`
                  : 'Calculating distance...'}
              </Text>
            </View>
            <Button
              label="I'm Boarding!"
              onPress={onBoarding}
              disabled={distanceToOrigin !== null && distanceToOrigin > 100}
              icon={<Ionicons name="bus" size={18} color="#fff" />}
            />
          </View>
        )}

        {state === 'transit' && (
          <View className="bg-primary/8 rounded-card py-4 items-center">
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              <Text className="text-primary font-bold text-base ml-3">
                En Route
              </Text>
            </View>
            <Text className="text-text-muted dark:text-text-dark-muted text-xs mt-1">
              Tracking your trip • Broadcasting GPS pings
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
