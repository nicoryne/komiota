import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '2026.03.26';

interface LinkItem {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  action: () => void;
  color: string;
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const links: LinkItem[] = [
    {
      icon: 'star',
      label: 'Rate the App',
      subtitle: 'Love Komiota? Leave us a review!',
      action: () => Alert.alert('Thank You!', 'Rating functionality will be available when the app is published on app stores.'),
      color: colors.status.warning,
    },
    {
      icon: 'share-social',
      label: 'Share with Friends',
      subtitle: 'Spread the word about Komiota',
      action: () => Alert.alert('Share', 'Sharing functionality will be available soon.'),
      color: colors.primary.DEFAULT,
    },
    {
      icon: 'logo-github',
      label: 'Open Source',
      subtitle: 'View our open source licenses',
      action: () => Linking.openURL('https://github.com/nicoryne/komiota'),
      color: isDark ? '#fff' : '#333',
    },
    {
      icon: 'globe',
      label: 'Website',
      subtitle: 'komiota.app',
      action: () => Linking.openURL('https://komiota.app'),
      color: colors.primary.DEFAULT,
    },
  ];

  const team = [
    { name: 'Nico', role: 'Developer', emoji: '👨‍💻' },
  ];

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
          About Komiota
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 60 }}
      >
        {/* App Identity */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 32 }}
        >
          {/* App icon */}
          <View
            style={{
              width: 104,
              height: 104,
              borderRadius: 32,
              backgroundColor: colors.primary.DEFAULT,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 16,
            }}
          >
            <Ionicons name="bus" size={48} color="#fff" />
          </View>

          <Text
            style={{
              color: isDark ? colors.text.dark : colors.text.DEFAULT,
              fontSize: 32,
              fontWeight: '900',
              letterSpacing: -0.8,
            }}
          >
            Komiota
          </Text>

          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 15,
              marginTop: 4,
              fontWeight: '500',
            }}
          >
            Your smart commute companion
          </Text>

          {/* Version pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: colors.primary.DEFAULT + '15',
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 100,
              }}
            >
              <Text style={{ color: colors.primary.DEFAULT, fontSize: 13, fontWeight: '700' }}>
                v{APP_VERSION}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 100,
              }}
            >
              <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 13, fontWeight: '600' }}>
                Build {BUILD_NUMBER}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Mission statement */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={{
            backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            borderWidth: isDark ? 1 : 0,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.04,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="heart" size={20} color={colors.primary.DEFAULT} style={{ marginRight: 10 }} />
            <Text
              style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontSize: 17, fontWeight: '800' }}
            >
              Our Mission
            </Text>
          </View>
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 15,
              lineHeight: 24,
            }}
          >
            Komiota is dedicated to making public transportation in Cebu more accessible, enjoyable, and rewarding. We believe every commuter deserves a smarter way to navigate the city — with real-time bus tracking, community-driven route data, and gamified features that make everyday commuting fun.
          </Text>
        </Animated.View>

        {/* Links */}
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
            Links
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
            {links.map((link, index) => (
              <React.Fragment key={link.label}>
                {index > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                      marginLeft: 82,
                    }}
                  />
                )}
                <Pressable
                  onPress={link.action}
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
                        backgroundColor: link.color + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}
                    >
                      <Ionicons name={link.icon} size={20} color={link.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontSize: 17, fontWeight: '600' }}
                      >
                        {link.label}
                      </Text>
                      {link.subtitle && (
                        <Text
                          style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 14, marginTop: 2 }}
                        >
                          {link.subtitle}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? colors.text.darkMuted : colors.text.muted} />
                  </View>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        {/* Team */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: 28 }}>
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
            Built By
          </Text>
          <View
            style={{
              backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
              borderRadius: 24,
              padding: 24,
              paddingVertical: 32,
              borderWidth: isDark ? 1 : 0,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 4,
              alignItems: 'center',
            }}
          >
            {team.map((member) => (
              <View key={member.name} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>{member.emoji}</Text>
                <Text
                  style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontSize: 19, fontWeight: '800' }}
                >
                  {member.name}
                </Text>
                <Text
                  style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 15, marginTop: 4, fontWeight: '500' }}
                >
                  {member.role}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 12 }}
        >
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 13,
              fontWeight: '500',
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Made with 💜 in Cebu{'\n'}
            © 2026 Komiota. All rights reserved.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
