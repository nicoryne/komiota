import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { colors } from '@/lib/colors';
import * as gamificationService from '@/services/gamification';
import type { Tables } from '@/lib/types';

// ─── Progress Bar ────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View className="flex-row gap-2 px-8 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <ProgressSegment key={i} active={i < step} />
      ))}
    </View>
  );
}

function ProgressSegment({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    width.value = withSpring(active ? 1 : 0, { damping: 20, stiffness: 200 });
  }, [active]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View className="flex-1 h-1 bg-primary/15 rounded-full overflow-hidden">
      <Animated.View
        style={fillStyle}
        className="h-full bg-primary rounded-full"
      />
    </View>
  );
}

// ─── Faction Card ────────────────────────────────────────────
function FactionCard({
  faction,
  selected,
  onPress,
}: {
  faction: Tables<'factions'>;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    borderOpacity.value = withTiming(selected ? 1 : 0, { duration: 200 });
    if (selected) {
      scale.value = withSpring(1.02, { damping: 12, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: 2,
    borderColor: selected ? colors.primary.DEFAULT : 'transparent',
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={cardStyle}
        className="bg-surface dark:bg-surface-dark rounded-card p-4 mb-3"
      >
        <View className="flex-row items-center">
          <View
            className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
            style={{ backgroundColor: selected ? colors.primary.DEFAULT + '20' : colors.primary.DEFAULT + '10' }}
          >
            <Ionicons
              name="shield"
              size={22}
              color={selected ? colors.primary.DEFAULT : colors.text.muted}
            />
          </View>
          <View className="flex-1">
            <Text className="text-text dark:text-text-dark font-bold text-base">
              {faction.name}
            </Text>
            {faction.description && (
              <Text
                className="text-text-muted dark:text-text-dark-muted text-xs mt-0.5"
                numberOfLines={2}
              >
                {faction.description}
              </Text>
            )}
          </View>
          {selected && (
            <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Wizard Steps ────────────────────────────────────────────
type Direction = 'forward' | 'backward';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction>('forward');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Factions
  const [factions, setFactions] = useState<Tables<'factions'>[]>([]);
  const [factionsLoading, setFactionsLoading] = useState(false);

  useEffect(() => {
    if (step === 3 && factions.length === 0) {
      setFactionsLoading(true);
      gamificationService
        .getFactions()
        .then(setFactions)
        .catch(() => {})
        .finally(() => setFactionsLoading(false));
    }
  }, [step]);

  const goNext = () => {
    setError('');
    setDirection('forward');
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError('');
    setDirection('backward');
    setStep((s) => s - 1);
  };

  // Validations
  const isStep1Valid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const isStep2Valid = () => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (username.length > 30) {
      setError('Username must be at most 30 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Only letters, numbers, and underscores allowed');
      return false;
    }
    return true;
  };

  const handleStep1Next = () => {
    if (isStep1Valid()) goNext();
  };

  const handleStep2Next = () => {
    if (isStep2Valid()) goNext();
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, {
        username,
        faction_id: selectedFaction ?? undefined,
      });
    } catch (err: any) {
      setError(err.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  // Choose entering/exiting animations based on direction
  const entering = direction === 'forward' ? SlideInRight.duration(350).springify() : SlideInLeft.duration(350).springify();
  const exiting = direction === 'forward' ? SlideOutLeft.duration(250) : SlideOutRight.duration(250);

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header with back button */}
        <View
          className="flex-row items-center px-4"
          style={{ paddingTop: insets.top > 0 ? 4 : 12 }}
        >
          {step > 1 ? (
            <Pressable
              onPress={goBack}
              className="w-10 h-10 rounded-full items-center justify-center active:bg-primary/10"
            >
              <Ionicons name="chevron-back" size={24} color={colors.text.DEFAULT} />
            </Pressable>
          ) : (
            <Link href="/(auth)/login" asChild>
              <Pressable className="w-10 h-10 rounded-full items-center justify-center active:bg-primary/10">
                <Ionicons name="chevron-back" size={24} color={colors.text.DEFAULT} />
              </Pressable>
            </Link>
          )}
          <View className="flex-1" />
          <Text className="text-text-muted dark:text-text-dark-muted text-sm font-medium mr-4">
            Step {step} of 3
          </Text>
        </View>

        <ProgressBar step={step} total={3} />

        {/* Step Content */}
        <View className="flex-1 px-8">
          {step === 1 && (
            <Animated.View
              key="step1"
              entering={entering}
              className="flex-1 justify-center"
            >
              <Text className="text-text dark:text-text-dark text-[28px] font-extrabold mb-2 tracking-tight">
                Let's get started
              </Text>
              <Text className="text-text-muted dark:text-text-dark-muted text-base mb-8">
                Create your account to start mapping Cebu's transit.
              </Text>

              <View className="gap-4 mb-6">
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={(text) => { setEmail(text); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChangeText={(text) => { setPassword(text); setError(''); }}
                  secureTextEntry
                />
              </View>

              {error ? (
                <View className="bg-status-error/10 rounded-card px-4 py-3 mb-4 flex-row items-center">
                  <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                  <Text className="text-status-error text-sm ml-2 flex-1">{error}</Text>
                </View>
              ) : null}

              <Button
                label="Continue"
                onPress={handleStep1Next}
                disabled={!email || !password}
                icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              />
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View
              key="step2"
              entering={entering}
              className="flex-1 justify-center"
            >
              <View className="w-16 h-16 bg-primary/10 rounded-[20px] items-center justify-center mb-6">
                <Ionicons name="person" size={32} color={colors.primary.DEFAULT} />
              </View>

              <Text className="text-text dark:text-text-dark text-[28px] font-extrabold mb-2 tracking-tight">
                What do we{'\n'}call you?
              </Text>
              <Text className="text-text-muted dark:text-text-dark-muted text-base mb-8">
                Pick a username — you can always change it later.
              </Text>

              <View className="mb-6">
                <Input
                  placeholder="cool_commuter"
                  value={username}
                  onChangeText={(text) => { setUsername(text); setError(''); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {error ? (
                <View className="bg-status-error/10 rounded-card px-4 py-3 mb-4 flex-row items-center">
                  <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                  <Text className="text-status-error text-sm ml-2 flex-1">{error}</Text>
                </View>
              ) : null}

              <Button
                label="Continue"
                onPress={handleStep2Next}
                disabled={!username}
                icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              />
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View
              key="step3"
              entering={entering}
              className="flex-1"
            >
              <View className="pt-4">
                <View className="w-16 h-16 bg-primary/10 rounded-[20px] items-center justify-center mb-6">
                  <Ionicons name="shield" size={32} color={colors.primary.DEFAULT} />
                </View>

                <Text className="text-text dark:text-text-dark text-[28px] font-extrabold mb-2 tracking-tight">
                  Pick your crew
                </Text>
                <Text className="text-text-muted dark:text-text-dark-muted text-base mb-6">
                  Join a faction to compete with other commuters.
                </Text>
              </View>

              {factionsLoading ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                </View>
              ) : (
                <View className="mb-4">
                  {factions.map((faction, i) => (
                    <Animated.View
                      key={faction.id}
                      entering={FadeInDown.delay(i * 100).duration(400).springify()}
                    >
                      <FactionCard
                        faction={faction}
                        selected={selectedFaction === faction.id}
                        onPress={() =>
                          setSelectedFaction(
                            selectedFaction === faction.id ? null : faction.id,
                          )
                        }
                      />
                    </Animated.View>
                  ))}
                </View>
              )}

              {error ? (
                <View className="bg-status-error/10 rounded-card px-4 py-3 mb-4 flex-row items-center">
                  <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                  <Text className="text-status-error text-sm ml-2 flex-1">{error}</Text>
                </View>
              ) : null}

              <View className="mt-auto pb-4">
                <Button
                  label="Create Account"
                  onPress={handleSignUp}
                  loading={loading}
                  icon={<Ionicons name="rocket" size={18} color="#fff" />}
                />
                <Pressable
                  onPress={() => {
                    setSelectedFaction(null);
                    handleSignUp();
                  }}
                  className="items-center mt-4 py-2"
                >
                  <Text className="text-text-muted dark:text-text-dark-muted text-sm">
                    Skip for now
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Sign in link — only show on step 1 */}
        {step === 1 && (
          <Animated.View
            entering={FadeIn.delay(400).duration(500)}
            className="flex-row items-center justify-center pb-4"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Text className="text-text-muted dark:text-text-dark-muted">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" className="text-primary font-semibold">
              Sign In
            </Link>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
