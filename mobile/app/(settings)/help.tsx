import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface FAQ {
  id: string;
  question: string;
  answer: string;
  icon: IoniconsName;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    question: 'How do I track my bus?',
    answer: 'Open the Explore tab and search for your destination. The app will find the best bus route for you, showing real-time tracking once you board.',
    icon: 'bus',
  },
  {
    id: '2',
    question: 'How does the leaderboard work?',
    answer: 'Earn points by completing bus rides. The more you ride, the higher your rank! Compete with other commuters in your area for weekly and monthly rankings.',
    icon: 'trophy',
  },
  {
    id: '3',
    question: 'Can I use the app offline?',
    answer: 'Bus stop data is cached locally so you can search routes offline. However, live tracking and leaderboard updates require an internet connection.',
    icon: 'cloud-offline',
  },
  {
    id: '4',
    question: 'How accurate is the arrival time?',
    answer: 'Arrival estimates are based on road conditions and bus schedules. Accuracy improves as more riders use the app and contribute real-time data.',
    icon: 'time',
  },
  {
    id: '5',
    question: 'How do I earn badges?',
    answer: 'Badges are awarded for milestones like completing your first ride, riding 10 times in a week, or maintaining a streak. Check your profile for progress!',
    icon: 'ribbon',
  },
];

interface ContactOption {
  icon: IoniconsName;
  label: string;
  subtitle: string;
  action: () => void;
  color: string;
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const contactOptions: ContactOption[] = [
    {
      icon: 'mail',
      label: 'Email Support',
      subtitle: 'support@komiota.app',
      action: () => Linking.openURL('mailto:support@komiota.app'),
      color: colors.primary.DEFAULT,
    },
    {
      icon: 'logo-facebook',
      label: 'Facebook Page',
      subtitle: '@KomiotaApp',
      action: () => Linking.openURL('https://facebook.com/KomiotaApp'),
      color: '#1877F2',
    },
    {
      icon: 'bug',
      label: 'Report a Bug',
      subtitle: 'Help us improve the app',
      action: () => Linking.openURL('mailto:bugs@komiota.app?subject=Bug%20Report'),
      color: colors.status.warning,
    },
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
          Help & Support
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
            <Ionicons name="help-buoy" size={40} color={colors.primary.DEFAULT} />
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
            Got a question? Find answers below or reach out to our team directly.
          </Text>
        </Animated.View>

        {/* FAQ Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
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
            Frequently Asked Questions
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
            {FAQS.map((faq, index) => {
              const isExpanded = expandedFAQ === faq.id;
              return (
                <React.Fragment key={faq.id}>
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
                    onPress={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                    style={({ pressed }) => ({
                      width: '100%',
                      marginVertical: 4,
                      opacity: pressed ? 0.8 : 1,
                      backgroundColor: isExpanded
                        ? (isDark ? 'rgba(90, 59, 207, 0.06)' : 'rgba(70, 39, 182, 0.03)')
                        : 'transparent',
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 28, width: '100%' }}>
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 14,
                          backgroundColor: colors.primary.DEFAULT + '15',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 16,
                        }}
                      >
                        <Ionicons name={faq.icon} size={20} color={colors.primary.DEFAULT} />
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          color: isDark ? colors.text.dark : colors.text.DEFAULT,
                          fontSize: 17,
                          fontWeight: '700',
                          paddingRight: 12,
                        }}
                      >
                        {faq.question}
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={isDark ? colors.text.darkMuted : colors.text.muted}
                      />
                    </View>
                    {isExpanded && (
                      <Animated.Text
                        entering={FadeIn.duration(200)}
                        layout={Layout.springify()}
                        style={{
                          color: isDark ? colors.text.darkMuted : colors.text.muted,
                          fontSize: 15,
                          lineHeight: 24,
                          marginTop: 12,
                          marginLeft: 58,
                        }}
                      >
                        {faq.answer}
                      </Animated.Text>
                    )}
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>
        </Animated.View>

        {/* Contact Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 28 }}>
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
            Get in Touch
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
            {contactOptions.map((option, index) => (
              <React.Fragment key={option.label}>
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
                  onPress={option.action}
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
                        backgroundColor: option.color + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}
                    >
                      <Ionicons name={option.icon} size={20} color={option.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontSize: 17, fontWeight: '600' }}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 14, marginTop: 2 }}
                      >
                        {option.subtitle}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? colors.text.darkMuted : colors.text.muted} />
                  </View>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
