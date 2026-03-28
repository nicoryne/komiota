import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { colors } from '@/lib/colors';
import { useColorScheme } from 'nativewind';

export default function LoginScreen() {
  const { colorScheme } = useColorScheme();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-8 justify-center">
          {/* Logo + Branding */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            className="items-center mb-10"
          >
            <View className="items-center justify-center mb-5">
              <Image
                source={
                  colorScheme === 'dark'
                    ? require('@/assets/images/icon-dark.png')
                    : require('@/assets/images/icon.png')
                }
                style={{ width: 80, height: 80 }}
                contentFit="contain"
              />
            </View>
            <Text className="text-text dark:text-text-dark text-3xl font-extrabold mb-2 tracking-tight">
              Welcome back 👋
            </Text>
            <Text className="text-text-muted dark:text-text-dark-muted text-base text-center">
              Sign in to continue your commute
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(600).springify()}
            className="gap-4 mb-6"
          >
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Animated.View>

          {error ? (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="bg-status-error/10 rounded-card px-4 py-3 mb-4 flex-row items-center"
            >
              <Ionicons name="alert-circle" size={18} color={colors.status.error} />
              <Text className="text-status-error text-sm ml-2 flex-1">{error}</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
            <Button
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              disabled={!email || !password}
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600).springify()}
            className="flex-row items-center my-8"
          >
            <View className="flex-1 h-px bg-text-muted/20" />
            <Text className="text-text-muted dark:text-text-dark-muted text-xs mx-4">
              NEW HERE?
            </Text>
            <View className="flex-1 h-px bg-text-muted/20" />
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600).springify()}
            className="items-center"
          >
            <Link href="/(auth)/register" asChild>
              <Pressable className="flex-row items-center bg-primary/8 px-6 py-3.5 rounded-pill active:bg-primary/15">
                <Text className="text-primary font-semibold text-base mr-2">
                  Create an account
                </Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary.DEFAULT} />
              </Pressable>
            </Link>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
