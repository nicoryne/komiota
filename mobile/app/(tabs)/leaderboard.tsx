import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { useLeaderboard } from '@/hooks/use-leaderboard';

export default function LeaderboardScreen() {
  const { leaderboard, isLoading } = useLeaderboard();

  return (
    <ScreenWrapper>
      <View className="px-6 pt-6 pb-4">
        <Text className="text-text dark:text-text-dark text-2xl font-extrabold">
          Leaderboard
        </Text>
        <Text className="text-text-muted dark:text-text-dark-muted text-sm mt-1">
          Top commuters helping map Cebu City
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted dark:text-text-dark-muted">Loading...</Text>
        </View>
      ) : leaderboard.length === 0 ? (
        <EmptyState
          title="No data yet"
          subtitle="The leaderboard will populate as commuters start tracking rides."
        />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8 gap-3"
          renderItem={({ item, index }) => (
            <Card>
              <View className="flex-row items-center">
                {/* Rank */}
                <Text className="text-primary font-extrabold text-lg w-8">
                  {index + 1}
                </Text>
                <Avatar uri={item.avatar_url} name={item.username} size="sm" />
                <View className="flex-1 ml-3">
                  <Text className="text-text dark:text-text-dark font-bold">
                    {item.username ?? 'Anonymous'}
                  </Text>
                  <Text className="text-text-muted dark:text-text-dark-muted text-xs">
                    {item.total_trips ?? 0} trips · {Math.round(item.total_distance_km ?? 0)} km
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary font-extrabold text-base">
                    {item.commuter_score ?? 0}
                  </Text>
                  <Badge label={item.rank_tier ?? 'Bronze'} />
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </ScreenWrapper>
  );
}
