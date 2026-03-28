import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/colors';

interface TermsSection {
  title: string;
  content: string;
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    content: 'By downloading, installing, or using the Komiota application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App. We reserve the right to modify these Terms at any time, and continued use of the App constitutes acceptance of any changes.',
  },
  {
    title: '2. Description of Services',
    content: 'Komiota provides public transportation navigation, real-time bus tracking, route planning, and gamified commuter features in Cebu City and surrounding areas. The App relies on GPS data, user-contributed information, and third-party mapping services to deliver these features.',
  },
  {
    title: '3. User Accounts',
    content: 'You must create an account to use certain features. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must provide accurate information and promptly update any changes. We reserve the right to suspend or terminate accounts that violate these Terms.',
  },
  {
    title: '4. User Conduct',
    content: 'You agree not to: (a) use the App for any unlawful purpose; (b) submit false or misleading bus stop information; (c) attempt to manipulate the leaderboard or gamification system; (d) interfere with the App\'s operation or security; (e) reverse-engineer or decompile the App; (f) use automated means to access the service.',
  },
  {
    title: '5. Location Data',
    content: 'The App collects location data to provide navigation and tracking services. By using the App, you consent to the collection and processing of your location data as described in our Privacy Policy. Location tracking occurs only during active trips unless you enable background tracking.',
  },
  {
    title: '6. User-Generated Content',
    content: 'You may submit bus stop locations, route information, and other content. By submitting content, you grant Komiota a non-exclusive, worldwide, royalty-free license to use, modify, and display the content. You represent that you have the right to submit such content and that it does not violate any third-party rights.',
  },
  {
    title: '7. Limitation of Liability',
    content: 'Komiota is provided "as is" without warranties of any kind. We do not guarantee the accuracy of bus schedules, arrival times, or route information. Komiota is not liable for any direct, indirect, incidental, or consequential damages arising from your use of the App, including missed buses or incorrect route information.',
  },
  {
    title: '8. Changes to Terms',
    content: 'We may update these Terms from time to time. We will notify you of any material changes through the App or via email. Your continued use of the App after changes are posted constitutes your acceptance of the modified Terms. The "Last Updated" date at the top of this page indicates when these Terms were last revised.',
  },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          Terms of Service
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 60 }}
      >
        {/* Last updated badge */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: colors.primary.DEFAULT + '15',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 100,
            marginTop: 8,
            marginBottom: 28,
          }}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.primary.DEFAULT} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.primary.DEFAULT, fontSize: 13, fontWeight: '700' }}>
            Last updated: March 2026
          </Text>
        </Animated.View>

        {/* Terms sections */}
        {TERMS_SECTIONS.map((section, index) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(150 + index * 50).duration(400)}
            style={{
              backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.03,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: isDark ? colors.text.dark : colors.text.DEFAULT,
                fontSize: 16,
                fontWeight: '800',
                marginBottom: 12,
                letterSpacing: -0.3,
              }}
            >
              {section.title}
            </Text>
            <Text
              style={{
                color: isDark ? colors.text.darkMuted : colors.text.muted,
                fontSize: 15,
                lineHeight: 24,
              }}
            >
              {section.content}
            </Text>
          </Animated.View>
        ))}

        {/* Footer note */}
        <Animated.View
          entering={FadeInDown.delay(650).duration(400)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 12,
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
            style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 13, lineHeight: 20, flex: 1 }}
          >
            If you have questions about these Terms, please contact us at legal@komiota.app.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
