import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/colors';
import { usePreferences } from '@/hooks/use-preferences';

interface Language {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { id: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { id: 'fil', label: 'Filipino', nativeLabel: 'Tagalog', flag: '🇵🇭' },
  { id: 'ceb', label: 'Cebuano', nativeLabel: 'Bisaya', flag: '🇵🇭' },
];

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference, loading } = usePreferences();

  if (loading) return null;

  const handleLanguageSelect = (id: string) => {
    if (id === preferences.language) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updatePreference('language', id);
    Alert.alert('Language Updated', 'The app will use the selected language upon the next restart.', [{ text: 'OK' }]);
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
          Language
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
            <Ionicons name="language" size={40} color={colors.primary.DEFAULT} />
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
            Select your preferred language for the app interface and notifications.
          </Text>
        </Animated.View>

        {/* Language list */}
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
          {LANGUAGES.map((lang, index) => {
            const isSelected = preferences.language === lang.id;
            return (
              <React.Fragment key={lang.id}>
                {index > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      marginLeft: 82,
                    }}
                  />
                )}
                <Pressable
                  onPress={() => handleLanguageSelect(lang.id)}
                  style={({ pressed }) => ({
                    width: '100%',
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: isSelected
                      ? (isDark ? 'rgba(90, 59, 207, 0.08)' : 'rgba(70, 39, 182, 0.06)')
                      : 'transparent',
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
                        backgroundColor: isSelected ? colors.primary.DEFAULT + '20' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{lang.flag}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isDark ? colors.text.dark : colors.text.DEFAULT,
                          fontSize: 17,
                          fontWeight: isSelected ? '700' : '600',
                        }}
                      >
                        {lang.label}
                      </Text>
                      <Text
                        style={{
                          color: isDark ? colors.text.darkMuted : colors.text.muted,
                          fontSize: 14,
                          marginTop: 2,
                          fontWeight: '500',
                        }}
                      >
                        {lang.nativeLabel}
                      </Text>
                    </View>
                    {isSelected && (
                      <Animated.View
                        entering={FadeIn.duration(200)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: colors.primary.DEFAULT,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: colors.primary.DEFAULT,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </Animated.View>
                    )}
                  </View>
                </Pressable>
              </React.Fragment>
            );
          })}
        </Animated.View>

        {/* Info */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 24, paddingHorizontal: 8 }}
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
            More languages coming soon. App restart is required for changes to take full effect globally.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
