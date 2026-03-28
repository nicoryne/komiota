import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  useColorScheme as useRNColorScheme,
  Appearance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { useGamification } from '@/hooks/use-gamification';
import { useImagePicker } from '@/hooks/use-image-picker';
import { Avatar } from '@/components/ui/avatar';
import { colors } from '@/lib/colors';

// ─── Types ──────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsRowProps {
  icon: IoniconsName;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
  isDark: boolean;
}

// ─── Rank tier styling ──────────────────────────────────────
const TIER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Bronze: { bg: '#CD7F3220', text: '#CD7F32', icon: '🥉' },
  Silver: { bg: '#C0C0C020', text: '#A0A0A0', icon: '🥈' },
  Gold: { bg: '#FFD70020', text: '#DAA520', icon: '🥇' },
  Platinum: { bg: '#E5E4E220', text: '#B0B0B0', icon: '💎' },
  Diamond: { bg: '#B9F2FF20', text: '#4FC3F7', icon: '💠' },
};

function getTierStyle(tier: string | null) {
  return TIER_COLORS[tier ?? 'Bronze'] ?? TIER_COLORS.Bronze;
}

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  isDark,
  delay,
}: {
  icon: IoniconsName;
  label: string;
  value: string | number;
  isDark: boolean;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      className="flex-1"
      style={{ marginHorizontal: 4 }}
    >
      <View
        style={{
          backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
          borderRadius: 20,
          padding: 16,
          alignItems: 'center',
          borderWidth: isDark ? 1 : 0,
          borderColor: 'rgba(90, 59, 207, 0.15)',
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary.DEFAULT + '18',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Ionicons name={icon} size={18} color={colors.primary.DEFAULT} />
        </View>
        <Text
          style={{
            color: isDark ? colors.text.dark : colors.text.DEFAULT,
            fontSize: 20,
            fontWeight: '800',
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            color: isDark ? colors.text.darkMuted : colors.text.muted,
            fontSize: 11,
            fontWeight: '500',
            marginTop: 2,
          }}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Settings Row ───────────────────────────────────────────
function SettingsRow({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  trailing,
  danger,
  isDark,
}: SettingsRowProps) {
  const content = (
    <View className="flex-row items-center py-3.5 px-4">
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: danger
            ? colors.status.error + '15'
            : (iconColor ?? colors.primary.DEFAULT) + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={danger ? colors.status.error : (iconColor ?? colors.primary.DEFAULT)}
        />
      </View>
      <View className="flex-1">
        <Text
          style={{
            color: danger
              ? colors.status.error
              : isDark
              ? colors.text.dark
              : colors.text.DEFAULT,
            fontSize: 15,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 12,
              marginTop: 1,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? colors.text.darkMuted : colors.text.muted}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// ─── Section wrapper ────────────────────────────────────────
function SettingsSection({
  title,
  children,
  isDark,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      style={{ marginHorizontal: 20, marginBottom: 20 }}
    >
      <Text
        style={{
          color: isDark ? colors.text.darkMuted : colors.text.muted,
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: isDark ? 1 : 0,
          borderColor: 'rgba(90, 59, 207, 0.12)',
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: isDark ? 'rgba(90, 59, 207, 0.1)' : 'rgba(70, 39, 182, 0.06)',
        marginLeft: 52,
      }}
    />
  );
}

// ─── Main Screen ────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useRNColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile(user?.id);
  const { userBadges } = useGamification(user?.id);
  const { pickAndUploadImage, isUploading: isAvatarUploading } = useImagePicker();

  const handleAvatarPress = async () => {
    const url = await pickAndUploadImage({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    }, 'avatars');
    
    if (url) {
      try {
        await updateProfile({ avatar_url: url });
      } catch (e: any) {
        Alert.alert('Update Failed', e.message || 'Failed to save new avatar to your profile.');
      }
    }
  };

  const handleThemeToggle = useCallback((value: boolean) => {
    Appearance.setColorScheme(value ? 'dark' : 'light');
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  if (isLoading || !profile) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? colors.background.dark : colors.background.DEFAULT }}
      >
        <Ionicons name="person-circle-outline" size={48} color={colors.primary.DEFAULT} />
        <Text
          style={{
            color: isDark ? colors.text.darkMuted : colors.text.muted,
            fontSize: 14,
            marginTop: 12,
          }}
        >
          Loading profile...
        </Text>
      </View>
    );
  }

  const tierStyle = getTierStyle(profile.rank_tier);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.DEFAULT }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ═══ HEADER ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{ alignItems: 'center', paddingTop: insets.top + 20, paddingBottom: 24 }}
        >
          {/* Avatar with glow */}
          <Pressable
            onPress={handleAvatarPress}
            disabled={isAvatarUploading}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              shadowColor: colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Avatar uri={profile.avatar_url} name={profile.username} size="lg" />
            
            {isAvatarUploading && (
              <View 
                className="absolute inset-0 bg-black/40 rounded-full items-center justify-center"
              >
                <ActivityIndicator color="#fff" />
              </View>
            )}
            
            {/* Edit icon badge */}
            <View 
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary.DEFAULT, borderWidth: 2, borderColor: isDark ? colors.background.dark : colors.background.DEFAULT }}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>

          {/* Name */}
          <Text
            style={{
              color: isDark ? colors.text.dark : colors.text.DEFAULT,
              fontSize: 24,
              fontWeight: '800',
              marginTop: 16,
            }}
          >
            {profile.username ?? 'Commuter'}
          </Text>

          {/* Email */}
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {user?.email}
          </Text>

          {/* Rank badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: tierStyle.bg,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 100,
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 14, marginRight: 6 }}>{tierStyle.icon}</Text>
            <Text style={{ color: tierStyle.text, fontSize: 13, fontWeight: '700' }}>
              {profile.rank_tier ?? 'Bronze'} Commuter
            </Text>
          </View>
        </Animated.View>

        {/* ═══ STATS ROW ═══ */}
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 16,
            marginBottom: 24,
          }}
        >
          <StatCard icon="star" label="Score" value={profile.commuter_score ?? 0} isDark={isDark} delay={100} />
          <StatCard icon="bus" label="Trips" value={profile.total_trips ?? 0} isDark={isDark} delay={150} />
          <StatCard icon="flame" label="Streak" value={profile.current_streak ?? 0} isDark={isDark} delay={200} />
          <StatCard icon="walk" label="km" value={Math.round(profile.total_distance_km ?? 0)} isDark={isDark} delay={250} />
        </View>

        {/* ═══ BADGES ═══ */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={{ marginHorizontal: 20, marginBottom: 24 }}
        >
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Badges
          </Text>
          <View
            style={{
              backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
              borderRadius: 20,
              padding: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: 'rgba(90, 59, 207, 0.12)',
            }}
          >
            {userBadges.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Ionicons name="ribbon-outline" size={32} color={colors.text.muted} />
                <Text
                  style={{
                    color: isDark ? colors.text.darkMuted : colors.text.muted,
                    fontSize: 13,
                    textAlign: 'center',
                    marginTop: 8,
                  }}
                >
                  No badges earned yet.{'\n'}Start tracking rides to unlock them!
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {userBadges.map((ub: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: colors.status.success + '18',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 100,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="trophy" size={14} color={colors.status.success} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.status.success, fontSize: 12, fontWeight: '600' }}>
                      {ub.badges?.name ?? 'Badge'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        {/* ═══ MODERATION ═══ */}
        {profile && (profile.role === 'admin' || profile.role === 'moderator') && (
          <SettingsSection title="Moderation Tools" isDark={isDark} delay={320}>
            <SettingsRow
              icon="shield-checkmark"
              iconColor={colors.status.warning}
              label="Review Pending Stops"
              subtitle="Approve or reject community submissions"
              isDark={isDark}
              onPress={() => router.push('/(settings)/moderation' as any)}
            />
          </SettingsSection>
        )}

        {/* ═══ PREFERENCES ═══ */}
        <SettingsSection title="Preferences" isDark={isDark} delay={350}>
          <SettingsRow
            icon="moon"
            label="Dark Mode"
            subtitle={isDark ? 'On' : 'Off'}
            isDark={isDark}
            trailing={
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{
                  false: '#D1D1D6',
                  true: colors.primary.DEFAULT,
                }}
                thumbColor="#fff"
              />
            }
          />
          <Divider isDark={isDark} />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            subtitle="Push & in-app alerts"
            isDark={isDark}
            onPress={() => router.push('/(settings)/notifications')}
          />
          <Divider isDark={isDark} />
          <SettingsRow
            icon="language"
            label="Language"
            subtitle="English"
            isDark={isDark}
            onPress={() => router.push('/(settings)/language')}
          />
        </SettingsSection>

        {/* ═══ GENERAL ═══ */}
        <SettingsSection title="General" isDark={isDark} delay={400}>
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            isDark={isDark}
            onPress={() => router.push('/(settings)/privacy')}
          />
          <Divider isDark={isDark} />
          <SettingsRow
            icon="help-circle-outline"
            label="Help & Support"
            isDark={isDark}
            onPress={() => router.push('/(settings)/help')}
          />
          <Divider isDark={isDark} />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            isDark={isDark}
            onPress={() => router.push('/(settings)/terms')}
          />
          <Divider isDark={isDark} />
          <SettingsRow
            icon="information-circle-outline"
            label="About Komiota"
            subtitle="v1.0.0"
            isDark={isDark}
            onPress={() => router.push('/(settings)/about')}
          />
        </SettingsSection>

        {/* ═══ ACCOUNT ═══ */}
        <SettingsSection title="Account" isDark={isDark} delay={450}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            isDark={isDark}
            danger
            onPress={handleSignOut}
          />
        </SettingsSection>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text
            style={{
              color: isDark ? colors.text.darkMuted : colors.text.muted,
              fontSize: 11,
              fontWeight: '500',
            }}
          >
            Made with 💜 in Cebu
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
