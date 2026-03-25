import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { useRoutes } from '@/hooks/use-routes';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/colors';

export default function RoutesScreen() {
  const routes = useRoutes();

  return (
    <ScreenWrapper>
      <View className="px-6 pt-6 pb-4">
        <Text className="text-text dark:text-text-dark text-2xl font-extrabold">
          Routes
        </Text>
        <Text className="text-text-muted dark:text-text-dark-muted text-sm mt-1">
          Browse all transit routes in Cebu City
        </Text>
      </View>

      {routes.length === 0 ? (
        <EmptyState
          title="No routes yet"
          subtitle="Routes will appear here after syncing with the server."
        />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8 gap-3"
          renderItem={({ item }) => (
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="bus" size={20} color={colors.primary.DEFAULT} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text dark:text-text-dark font-bold text-base">
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text className="text-text-muted dark:text-text-dark-muted text-xs mt-0.5" numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {item.pointMultiplier > 1 && (
                  <Badge label={`${item.pointMultiplier}x`} variant="success" />
                )}
              </View>
            </Card>
          )}
        />
      )}
    </ScreenWrapper>
  );
}
