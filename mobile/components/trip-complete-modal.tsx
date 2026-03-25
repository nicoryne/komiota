import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { colors } from '@/lib/colors';

interface TripCompleteModalProps {
  visible: boolean;
  scoreEarned?: number;
  onDismiss: () => void;
}

export function TripCompleteModal({
  visible,
  scoreEarned = 50,
  onDismiss,
}: TripCompleteModalProps) {
  const insets = useSafeAreaInsets();
  const scoreScale = useSharedValue(0.5);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      checkScale.value = withDelay(
        200,
        withSpring(1, { damping: 8, stiffness: 150 }),
      );
      scoreScale.value = withDelay(
        500,
        withSequence(
          withSpring(1.2, { damping: 6, stiffness: 200 }),
          withSpring(1, { damping: 10, stiffness: 200 }),
        ),
      );
    } else {
      checkScale.value = 0;
      scoreScale.value = 0.5;
    }
  }, [visible]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="absolute inset-0 z-50 items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <Animated.View
        entering={ZoomIn.delay(100).duration(400).springify()}
        className="bg-surface dark:bg-surface-dark rounded-card-lg mx-8 p-8 items-center w-80"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          elevation: 16,
        }}
      >
        {/* Animated checkmark */}
        <Animated.View
          style={checkStyle}
          className="w-20 h-20 bg-status-success rounded-full items-center justify-center mb-6"
        >
          <Ionicons name="checkmark" size={44} color="#fff" />
        </Animated.View>

        <Text className="text-text dark:text-text-dark text-2xl font-extrabold mb-2 text-center">
          Trip Complete! 🎉
        </Text>
        <Text className="text-text-muted dark:text-text-dark-muted text-sm text-center mb-6">
          Thanks for helping map Cebu's transit network.
        </Text>

        {/* Score earned */}
        <Animated.View
          style={scoreStyle}
          className="bg-primary/10 rounded-card px-6 py-4 items-center mb-6 w-full"
        >
          <View className="flex-row items-center">
            <Ionicons name="star" size={24} color={colors.primary.DEFAULT} />
            <Text
              className="text-primary text-3xl font-extrabold ml-2"
            >
              +{scoreEarned}
            </Text>
          </View>
          <Text className="text-primary/70 text-xs font-semibold mt-1">
            Commuter Score Earned
          </Text>
        </Animated.View>

        {/* Dismiss button */}
        <Pressable
          onPress={onDismiss}
          className="bg-primary w-full py-4 rounded-pill items-center active:opacity-80"
        >
          <Text className="text-white font-bold text-base">Done</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
