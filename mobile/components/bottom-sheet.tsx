import React, { useCallback } from 'react';
import { View, Dimensions, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { colors } from '../lib/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.75;
const MID_TRANSLATE_Y = -SCREEN_HEIGHT * 0.4;
const MIN_TRANSLATE_Y = -SCREEN_HEIGHT * 0.15;

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };

interface BottomSheetProps {
  children: React.ReactNode;
}

export function BottomSheet({ children }: BottomSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateY = useSharedValue(MIN_TRANSLATE_Y);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(
        MAX_TRANSLATE_Y,
        Math.min(MIN_TRANSLATE_Y, context.value.y + event.translationY),
      );
    })
    .onEnd((event) => {
      // Snap to closest position
      const velocity = event.velocityY;
      if (velocity > 500) {
        translateY.value = withSpring(MIN_TRANSLATE_Y, SPRING_CONFIG);
      } else if (velocity < -500) {
        translateY.value = withSpring(MAX_TRANSLATE_Y, SPRING_CONFIG);
      } else {
        // Snap to nearest
        const positions = [MIN_TRANSLATE_Y, MID_TRANSLATE_Y, MAX_TRANSLATE_Y];
        const nearest = positions.reduce((prev, curr) =>
          Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev,
        );
        translateY.value = withSpring(nearest, SPRING_CONFIG);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderTopLeftRadius: interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, MIN_TRANSLATE_Y],
      [24, 32],
      Extrapolation.CLAMP,
    ),
    borderTopRightRadius: interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, MIN_TRANSLATE_Y],
      [24, 32],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SCREEN_HEIGHT,
            left: 0,
            right: 0,
            height: SCREEN_HEIGHT,
            backgroundColor: isDark ? colors.surface.dark : colors.background.DEFAULT,
            shadowColor: colors.primary.DEFAULT,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 24,
          },
          animatedStyle,
        ]}
      >
        {/* Drag handle */}
        <View className="items-center pt-3 pb-2">
          <View className="w-10 h-1 bg-text-muted/30 rounded-pill" />
        </View>
        {/* Content */}
        <View className="flex-1 px-5 pt-2">{children}</View>
      </Animated.View>
    </GestureDetector>
  );
}
