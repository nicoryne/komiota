import React, { useEffect } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/lib/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AnimatedSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  style?: ViewStyle;
}

export function AnimatedSwitch({ value, onValueChange, style }: AnimatedSwitchProps) {
  const progress = useSharedValue(value ? 1 : 0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      mass: 0.8,
      damping: 15,
      stiffness: 200,
      overshootClamping: false,
    });
  }, [value, progress]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const inactiveColor = isDark ? '#3A3A3C' : '#E5E5EA';
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, colors.primary.DEFAULT]
    );
    return { backgroundColor };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = progress.value * 22; // 50 width - 24 thumb width - 4 padding
    return {
      transform: [{ translateX }],
    };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        {
          width: 50,
          height: 30,
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: 50,
            height: 30,
            borderRadius: 16,
            position: 'absolute',
          },
          trackAnimatedStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: 24,
            height: 24,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
            marginLeft: 3,
          },
          thumbAnimatedStyle,
        ]}
      />
    </Pressable>
  );
}
