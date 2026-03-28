import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/colors';
import { AnimatedSwitch } from '@/components/ui/animated-switch';
import { usePreferences, Preferences } from '@/hooks/use-preferences';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface PrivacyItem {
  key: keyof Preferences;
  icon: IoniconsName;
  label: string;
  subtitle: string;
}

const SETTINGS: PrivacyItem[] = [
  { key: 'location_sharing', icon: 'location', label: 'Location Sharing', subtitle: 'Share location during active trips' },
  { key: 'analytics', icon: 'bar-chart', label: 'Usage Analytics', subtitle: 'Help improve the app with anonymous data' },
  { key: 'personalized_ads', icon: 'megaphone', label: 'Personalized Offers', subtitle: 'Show relevant tips based on your usage' },
];

interface InfoSection {
  icon: IoniconsName;
  title: string;
  description: string;
}

const INFO_SECTIONS: InfoSection[] = [
  {
    icon: 'analytics',
    title: 'Data We Collect',
    description: 'We collect location data during active trips, ride history, and app usage analytics to improve your commuting experience.',
  },
  {
    icon: 'time',
    title: 'Data Retention',
    description: 'Trip data is retained for 12 months. Anonymized analytics are kept for service improvement. You can request deletion at any time.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Security Measures',
    description: 'All data is encrypted in transit and at rest. We use industry-standard security protocols to protect your information.',
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference, loading } = usePreferences();

  if (loading) return null;

  const handleDeleteData = () => {
    Alert.alert(
      'Delete My Data',
      'Are you sure you want to request deletion of all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Request Sent', 'Your data deletion request has been submitted. We will process it within 30 days.'),
        },
      ],
    );
  };

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
          Privacy & Security
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 60 }}
      >
        {/* Hero */}
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
            <Ionicons name="shield-checkmark" size={40} color={colors.primary.DEFAULT} />
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
            Your privacy matters to us. Control how your data is collected, shared, and used.
          </Text>
        </Animated.View>

        {/* Privacy toggles */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={{
            backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
            borderRadius: 24,
            overflow: 'hidden',
            borderWidth: isDark ? 1 : 0,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.04,
            shadowRadius: 16,
            elevation: 4,
            marginBottom: 28,
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
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
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
                      style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontSize: 17, fontWeight: '600' }}
                    >
                      {setting.label}
                    </Text>
                    <Text
                      style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 14, marginTop: 2 }}
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

        {/* Info sections */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text
            style={{
              color: isDark ? colors.text.dark : colors.text.muted,
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            How We Handle Your Data
          </Text>
          <View
            style={{
              backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
              borderRadius: 24,
              overflow: 'hidden',
              borderWidth: isDark ? 1 : 0,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            {INFO_SECTIONS.map((section, index) => (
              <React.Fragment key={section.title}>
                {index > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                      marginLeft: 82,
                    }}
                  />
                )}
                <View style={{ flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 24 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor: colors.primary.DEFAULT + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                      marginTop: 2,
                    }}
                  >
                    <Ionicons name={section.icon} size={20} color={colors.primary.DEFAULT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontSize: 17, fontWeight: '700' }}
                    >
                      {section.title}
                    </Text>
                    <Text
                      style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 14, lineHeight: 22, marginTop: 4 }}
                    >
                      {section.description}
                    </Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        {/* Delete data button */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: 28 }}>
          <View style={{
            backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
            borderRadius: 24,
            overflow: 'hidden',
            borderWidth: isDark ? 1 : 0,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.04,
            shadowRadius: 16,
            elevation: 4,
          }}>
            <Pressable
              onPress={handleDeleteData}
              style={({ pressed }) => ({
                width: '100%',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 20,
                  paddingHorizontal: 24,
                  width: '100%',
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: colors.status.error + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Ionicons name="trash" size={20} color={colors.status.error} />
                </View>
                <Text style={{ color: colors.status.error, fontSize: 17, fontWeight: '700' }}>
                  Request Data Deletion
                </Text>
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
