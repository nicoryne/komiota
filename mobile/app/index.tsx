import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/lib/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────
interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  showLogo: boolean;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'navigate',
    title: 'Navigate Cebu City\nOffline',
    subtitle:
      'Find BRT routes and track bus stops — even without mobile data.',
    showLogo: true,
  },
  {
    id: '2',
    icon: 'people',
    title: 'Community-Powered\nTransit',
    subtitle:
      'Help map routes and verify bus stop statuses in real-time with other commuters.',
    showLogo: false,
  },
  {
    id: '3',
    icon: 'trophy',
    title: 'Earn Rewards\nas You Ride',
    subtitle:
      'Collect points for every ride, climb the leaderboard, and unlock exclusive badges.',
    showLogo: false,
  },
];

// ─── Pagination dot ───────────────────────────────────────────
function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 24 : 8);
  const opacity = useSharedValue(active ? 1 : 0.4);

  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(active ? 1 : 0.4, { duration: 300 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          height: 6,
          borderRadius: 3,
          backgroundColor: '#ffffff',
          marginHorizontal: 4,
        },
        style,
      ]}
    />
  );
}

// ─── Individual slide component ───────────────────────────────
function OnboardingSlide({
  item,
  index,
  activeIndex,
}: {
  item: Slide;
  index: number;
  activeIndex: number;
}) {
  const isActive = index === activeIndex;

  // Logo entrance animation (only slide 0)
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    if (item.showLogo && isActive) {
      logoOpacity.value = withTiming(1, { duration: 600 });
      logoScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 120 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
    }
  }, [isActive]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  // Icon entrance for non-logo slides
  const iconScale = useSharedValue(0.5);
  const iconOpacity = useSharedValue(0);

  useEffect(() => {
    if (!item.showLogo && isActive) {
      iconOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      iconScale.value = withDelay(
        200,
        withSpring(1, { damping: 10, stiffness: 150 }),
      );
    } else if (!item.showLogo && !isActive) {
      iconOpacity.value = withTiming(0, { duration: 200 });
      iconScale.value = withTiming(0.5, { duration: 200 });
    }
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  // Text entrance
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);

  useEffect(() => {
    if (isActive) {
      textOpacity.value = withDelay(
        item.showLogo ? 500 : 350,
        withTiming(1, { duration: 500 }),
      );
      textTranslateY.value = withDelay(
        item.showLogo ? 500 : 350,
        withSpring(0, { damping: 15, stiffness: 120 }),
      );
    } else {
      textOpacity.value = withTiming(0, { duration: 200 });
      textTranslateY.value = withTiming(30, { duration: 200 });
    }
  }, [isActive]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 items-center justify-center px-10"
    >
      {/* Logo or Icon */}
      {item.showLogo ? (
        <Animated.View style={logoStyle} className="mb-10">
          <View className="w-28 h-28 bg-white/15 rounded-[32px] items-center justify-center border-2 border-white/20">
            <Image
              source={require('@/assets/images/logo.svg')}
              style={{ width: 80, height: 80 }}
              contentFit="contain"
            />
          </View>
        </Animated.View>
      ) : (
        <Animated.View
          style={iconStyle}
          className="mb-10 w-24 h-24 bg-white/15 rounded-[28px] items-center justify-center border-2 border-white/20"
        >
          <Ionicons name={item.icon} size={44} color="rgba(255,255,255,0.9)" />
        </Animated.View>
      )}

      {/* Text content */}
      <Animated.View style={textStyle} className="items-center">
        <Text className="text-white text-[28px] font-extrabold text-center mb-4 leading-9 tracking-tight">
          {item.title}
        </Text>
        <Text className="text-white/70 text-base text-center leading-6 max-w-[280px]">
          {item.subtitle}
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Main onboarding screen ──────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === SLIDES.length - 1;

  // Button pulse animation on last slide
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (isLastSlide) {
      buttonScale.value = withSequence(
        withDelay(800, withSpring(1.04, { damping: 6, stiffness: 200 })),
        withSpring(1, { damping: 8, stiffness: 200 }),
      );
    }
  }, [isLastSlide]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (isLastSlide) {
      router.replace('/(auth)/login');
    } else {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.primary.DEFAULT }}>
      {/* Background gradient overlay */}
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: colors.primary.dark,
          opacity: 0.3,
        }}
      />

      {/* Decorative circle elements */}
      <View
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          top: -80,
          right: -100,
          backgroundColor: 'rgba(255,255,255,0.04)',
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          bottom: 180,
          left: -60,
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}
      />

      {/* Skip button */}
      <Animated.View
        entering={FadeIn.delay(800).duration(500)}
        className="absolute z-10"
        style={{ top: insets.top + 12, right: 24 }}
      >
        <Pressable
          onPress={handleSkip}
          className="px-4 py-2 rounded-pill bg-white/10 active:bg-white/20"
        >
          <Text className="text-white/80 text-sm font-semibold">Skip</Text>
        </Pressable>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            item={item}
            index={index}
            activeIndex={activeIndex}
          />
        )}
        style={{ flex: 1 }}
      />

      {/* Bottom section */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(600).easing(Easing.out(Easing.quad))}
        className="px-8 pb-4"
        style={{ paddingBottom: Math.max(insets.bottom, 24) + 8 }}
      >
        {/* Pagination dots */}
        <View className="flex-row items-center justify-center mb-8">
          {SLIDES.map((_, i) => (
            <Dot key={i} active={i === activeIndex} />
          ))}
        </View>

        {/* Next / Get Started button */}
        <Animated.View style={buttonAnimStyle}>
          <Pressable
            onPress={handleNext}
            className="w-full py-4 rounded-pill items-center justify-center flex-row active:opacity-80"
            style={{
              backgroundColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              className="font-bold text-lg mr-2"
              style={{ color: colors.primary.DEFAULT }}
            >
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={isLastSlide ? 'rocket' : 'arrow-forward'}
              size={20}
              color={colors.primary.DEFAULT}
            />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
