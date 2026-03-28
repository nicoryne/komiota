import type { SearchResult } from '@/hooks/use-offline-search';
import { colors } from '@/lib/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type SearchPanelProps = {
  isDark: boolean;
  insetsTop: number;
  insetsBottom: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean) => void;
  isSearching: boolean;
  results: SearchResult[];
  nearbyStops: SearchResult[];
  handleSearchChange: (text: string) => void;
  handleSelectResult: (result: SearchResult) => void;
  locationName: string | null;
  coordsAvailable: boolean;
  onHelpPress: () => void;
  onRecenter: () => void;
};

export function SearchPanel({
  isDark,
  insetsTop,
  insetsBottom,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
  isSearching,
  results,
  nearbyStops,
  handleSearchChange,
  handleSelectResult,
  locationName,
  coordsAvailable,
  onHelpPress,
  onRecenter,
}: SearchPanelProps) {
  const data = results.length > 0 ? results : (searchQuery.length < 2 ? nearbyStops : []);

  return (
    <>
      <View style={[styles.searchBarContainer, { top: insetsTop + 20 }]}> 
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT, borderColor: isDark ? 'rgba(90, 59, 207, 0.3)' : 'transparent' }]}>
          <Ionicons name="search" size={20} color={isDark ? colors.text.dark : colors.text.DEFAULT} />
          <TextInput
            style={[styles.searchTextInput, { color: isDark ? colors.text.dark : colors.text.DEFAULT }]}
            value={searchQuery}
            placeholder="Where are you going?"
            placeholderTextColor={isDark ? colors.text.darkMuted : colors.text.muted}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearchChange(text);
            }}
            onFocus={() => setIsSearchOpen(true)}
            returnKeyType="search"
          />
          <Pressable onPress={() => setIsSearchOpen(true)} style={styles.searchActionButton}>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>

      {coordsAvailable && (
        <View style={[styles.currentLocationCard, { bottom: insetsBottom + 100, backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT, borderColor: isDark ? 'rgba(90, 59, 207, 0.2)' : 'transparent' }]}>
          <View style={[styles.locationMarker, { backgroundColor: colors.primary.DEFAULT + '20' }]}> 
            <Ionicons name="navigate" size={16} color={isDark ? colors.text.dark : colors.primary.DEFAULT} />
          </View>
          <View style={{ maxWidth: 160 }}>
            <Text style={[styles.locationLabel, { color: isDark ? colors.text.darkMuted : colors.text.muted }]}>Your location</Text>
            <Text style={[styles.locationValue, { color: isDark ? colors.text.dark : colors.text.DEFAULT }]} numberOfLines={1}>
              {locationName || 'Locating...'}
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.rightButtonContainer, { bottom: insetsBottom + 160 }]}> 
        <Pressable onPress={onHelpPress} style={[styles.iconButton, { backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT, borderColor: isDark ? 'rgba(90, 59, 207, 0.25)' : 'transparent' }]}> 
          <Ionicons name="information-circle" size={22} color={isDark ? colors.text.dark : colors.primary.DEFAULT} />
        </Pressable>
      </View>

      <View style={[styles.rightButtonContainer, { bottom: insetsBottom + 100 }]}> 
        <Pressable onPress={onRecenter} style={[styles.iconButton, { backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT, borderColor: isDark ? 'rgba(90, 59, 207, 0.25)' : 'transparent' }]}> 
          <Ionicons name="locate" size={22} color={isDark ? colors.text.dark : colors.primary.DEFAULT} />
        </Pressable>
      </View>

      {isSearchOpen && (
        <View style={[styles.searchOverlay, { backgroundColor: isDark ? colors.background.dark : colors.background.DEFAULT }]}> 
          <View style={[styles.searchBar, { backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT, borderColor: isDark ? 'rgba(90, 59, 207, 0.3)' : 'transparent' }]}> 
            <Pressable onPress={() => { setIsSearchOpen(false); setSearchQuery(''); }} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={20} color={isDark ? colors.text.dark : colors.text.DEFAULT} />
            </Pressable>
            <TextInput
              style={[styles.searchTextInput, { color: isDark ? colors.text.dark : colors.text.DEFAULT }]}
              placeholder="Where are you going?"
              placeholderTextColor={isDark ? colors.text.darkMuted : colors.text.muted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                handleSearchChange(text);
              }}
              autoFocus
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            ) : (
              <View style={styles.searchActionButton}>
                <Ionicons name="search" size={16} color="#fff" />
              </View>
            )}
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4 }}
            ListHeaderComponent={data.length===0 && searchQuery.length<2 && nearbyStops.length>0 ? (
              <View style={{ paddingBottom: 8, paddingTop: 8 }}>
                <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform:'uppercase' }}>
                  Nearby Stops
                </Text>
              </View>
            ) : null}
            renderItem={({ item, index }) => {
              const distanceText = item.distanceKm != null
                ? item.distanceKm < 1
                  ? `${Math.round(item.distanceKm * 1000)} m`
                  : `${item.distanceKm.toFixed(1)} km`
                : null;
              const addressText = item.address || (item.source === 'local' ? 'Bus Stop' : 'Place');

              return (
                <Pressable
                  onPress={() => handleSelectResult(item)}
                  style={styles.searchItem}
                >
                  <View style={[styles.searchItemIcon, { backgroundColor: colors.primary.DEFAULT + (isDark ? '25' : '15') }]}>
                    <Ionicons name={item.source === 'local' ? 'location' : 'globe-outline'} size={20} color={colors.primary.DEFAULT} />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 12, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>
                      {distanceText ? `${distanceText} · ` : ''}{addressText}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? colors.text.darkMuted : colors.text.muted} />
                </Pressable>
              );
            }}
            ListEmptyComponent={searchQuery.length >= 2 && !isSearching ? (
              <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                <Ionicons name="search-outline" size={40} color={isDark ? colors.text.darkMuted : colors.text.muted} />
                <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 14, marginTop: 12 }}>
                  No results found
                </Text>
              </View>
            ) : null}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    padding: 0,
  },
  searchActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.DEFAULT,
  },
  currentLocationCard: {
    position: 'absolute',
    left: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 20,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingTop: 16,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(70, 39, 182, 0.08)',
  },
  searchItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});