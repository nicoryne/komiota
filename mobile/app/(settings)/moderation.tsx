import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/colors';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { usePendingStops } from '@/hooks/use-pending-stops';

export default function ModerationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const {
    pendingStops,
    loading,
    refreshing,
    actioningId,
    refresh,
    updateStatus,
    removeStop,
  } = usePendingStops();

  // Authorization check
  if (!isProfileLoading && profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <Ionicons name="lock-closed" size={48} color={colors.status.error} />
        <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="text-lg font-bold mt-4">
          Access Denied
        </Text>
      </View>
    );
  }

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    Alert.alert(
      `Confirm ${newStatus === 'approved' ? 'Approval' : 'Rejection'}`,
      `Are you sure you want to mark this stop as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: newStatus === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await updateStatus(id, newStatus);
            } catch (err: any) {
              Alert.alert('Error', err.message || `Failed to update status to ${newStatus}.`);
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Stop Completely',
      'This will permanently remove the stop from the database. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeStop(id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete bus stop.');
            }
          }
        }
      ]
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
            borderColor: 'rgba(255,255,255,0.08)',
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
          Moderation Tools
        </Text>
      </Animated.View>

      {/* ═══ LIST ═══ */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary.DEFAULT} />}
        >
          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-6 px-2">
            <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted }} className="text-sm font-medium">
              Review bus stops submitted by regular users. You can approve them to make them visible to everyone, reject them, or completely delete them from the database.
            </Text>
          </Animated.View>

          {pendingStops.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(200).duration(400)} className="items-center justify-center py-20">
              <Ionicons name="checkmark-done-circle" size={64} color={colors.status.success + '80'} />
              <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="text-lg font-bold mt-4 text-center">
                All Caught Up!
              </Text>
              <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted }} className="text-sm text-center mt-2">
                There are no pending bus stops to review.
              </Text>
            </Animated.View>
          ) : (
            pendingStops.map((stop, index) => (
              <Animated.View 
                key={stop.id}
                entering={FadeInDown.delay(150 + index * 50).duration(300)}
                className="mb-4 rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: 'rgba(255,255,255,0.08)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.04,
                  shadowRadius: 16,
                  elevation: 4,
                }}
              >
                <View className="p-5">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                      <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="text-lg font-bold">
                        {stop.name}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="person" size={12} color={isDark ? colors.text.darkMuted : colors.text.muted} />
                        <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted }} className="text-xs ml-1 flex-1" numberOfLines={1}>
                          Submitted By ID: {stop.created_by?.split('-')[0]}...
                        </Text>
                      </View>
                    </View>
                    
                    <View className="bg-warning/15 px-3 py-1.5 rounded-full items-center justify-center">
                      <Text style={{ color: colors.status.warning, fontWeight: '700', fontSize: 12 }}>Pending</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row items-center mt-6 gap-3">
                    <Pressable
                      onPress={() => handleStatusUpdate(stop.id, 'rejected')}
                      disabled={actioningId === stop.id}
                      className="flex-1 items-center justify-center py-3 rounded-xl border"
                      style={{
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        opacity: actioningId === stop.id ? 0.5 : 1
                      }}
                    >
                      <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }} className="font-semibold text-sm">
                        Reject
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleStatusUpdate(stop.id, 'approved')}
                      disabled={actioningId === stop.id}
                      className="flex-1 items-center justify-center py-3 rounded-xl flex-row"
                      style={{
                        backgroundColor: colors.primary.DEFAULT,
                        opacity: actioningId === stop.id ? 0.7 : 1
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="#ffffff" className="mr-1" />
                      <Text className="text-white font-bold text-sm">Approve</Text>
                    </Pressable>
                  </View>

                  {/* Admin specific deletion */}
                  {profile?.role === 'admin' && (
                    <Pressable
                      onPress={() => handleDelete(stop.id)}
                      disabled={actioningId === stop.id}
                      className="mt-4 flex-row items-center justify-center py-3 rounded-xl"
                      style={{ backgroundColor: colors.status.error + '15' }}
                    >
                      <Ionicons name="trash" size={16} color={colors.status.error} />
                      <Text style={{ color: colors.status.error }} className="font-semibold text-sm ml-1.5">
                        Permanently Delete
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
