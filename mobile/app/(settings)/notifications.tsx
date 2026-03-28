import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/colors';
import { AnimatedSwitch } from '@/components/ui/animated-switch';
import { usePreferences, Preferences } from '@/hooks/use-preferences';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface NotificationItem {
  key: keyof Preferences;
  icon: IoniconsName;
  label: string;
  subtitle: string;
}

const SETTINGS: NotificationItem[] = [
  { key: 'push_notifications', icon: 'notifications', label: 'Push Notifications', subtitle: 'Receive alerts on your device' },
  { key: 'trip_updates', icon: 'bus', label: 'Trip Updates', subtitle: 'Boarding reminders & arrival alerts' },
  { key: 'promotions', icon: 'megaphone', label: 'Promotions & Offers', subtitle: 'New features, deals & events' },
  { key: 'leaderboard', icon: 'trophy', label: 'Leaderboard', subtitle: 'Rank changes & achievements' },
  { key: 'sound', icon: 'volume-high', label: 'Sound', subtitle: 'Play notification sounds' },
  { key: 'vibration', icon: 'phone-portrait', label: 'Vibration', subtitle: 'Haptic feedback on notifications' },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference, loading } = usePreferences();

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.DEFAULT }}>
      {/* ═══ HEADER ═══ */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 20,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: isDark ? 1 : 0,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? colors.primary.light : colors.text.DEFAULT} />
        </Pressable>
        <Text
          style={{
            color: isDark ? colors.text.dark : colors.text.DEFAULT,
            fontSize: 22,
            fontWeight: '800',
            marginLeft: 16,
            letterSpacing: -0.5,
          }}
        >
          Notifications
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 60 }}
      >
        {/* Hero illustration */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{ alignItems: 'center', paddingVertical: 32 }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 28,
              backgroundColor: colors.primary.DEFAULT + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="notifications" size={40} color={colors.primary.DEFAULT} />
          </View>
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
              fontWeight: '500',
              maxWidth: 300,
            }}
          >
            Choose which notifications you'd like to receive to stay updated on your commute.
          </Text>
        </Animated.View>

        {/* Notification toggles */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={{
            backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
            borderRadius: 24,
            overflow: 'hidden',
            borderWidth: isDark ? 1 : 0,
            borderColor: 'rgba(255,255,255,0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.04,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          {SETTINGS.map((setting, index) => {
            const isEnabled = !!preferences[setting.key];
            return (
              <React.Fragment key={setting.key}>
                {index > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      marginLeft: 82,
                    }}
                  />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor: (isEnabled ? colors.primary.DEFAULT : colors.text.muted) + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Ionicons
                      name={setting.icon}
                      size={20}
                      color={isEnabled ? colors.primary.DEFAULT : colors.text.muted}
                    />
                  </View>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text
                      style={{
                        color: isDark ? colors.text.dark : colors.text.DEFAULT,
                        fontSize: 17,
                        fontWeight: '600',
                        letterSpacing: -0.3,
                      }}
                    >
                      {setting.label}
                    </Text>
                    <Text
                      style={{
                        color: isDark ? colors.text.darkMuted : colors.text.muted,
                        fontSize: 14,
                        marginTop: 2,
                        fontWeight: '400',
                      }}
                    >
                      {setting.subtitle}
                    </Text>
                  </View>
                  <AnimatedSwitch
                    value={isEnabled}
                    onValueChange={(val) => updatePreference(setting.key, val)}
                  />
                </View>
              </React.Fragment>
            );
          })}
        </Animated.View>

        {/* Info note */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 24,
            paddingHorizontal: 8,
          }}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color={isDark ? colors.text.darkMuted : colors.text.muted}
            style={{ marginRight: 10, marginTop: 2 }}
          />
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 13,
              lineHeight: 20,
              flex: 1,
            }}
          >
            You can also manage notifications from your device's system settings. Some notifications are required for active trip safety.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
