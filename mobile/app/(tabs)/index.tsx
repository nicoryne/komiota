import { AddBusStopBottomSheet } from '@/components/add-bus-stop-bottom-sheet';
import { RouteBottomSheet } from '@/components/route-bottom-sheet';
import { TripCompleteModal } from '@/components/trip-complete-modal';
import { useAuth } from '@/hooks/use-auth';
import { useBusStops } from '@/hooks/use-bus-stops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOfflineRouting, type RoutePlan } from '@/hooks/use-offline-routing';
import { useOfflineSearch, type SearchResult } from '@/hooks/use-offline-search';
import { useTrip } from '@/hooks/use-trip';
import { useUserLocation } from '@/hooks/use-user-location';
import { colors } from '@/lib/colors';
import {
  BUILDING_COLOR,
  CEBU_CENTER,
  DEFAULT_BEARING,
  DEFAULT_PITCH,
  DEFAULT_ZOOM,
  GEOFENCE_RADIUS_METERS,
  MAP_STYLE_URL
} from '@/lib/map-config';
import { Ionicons } from '@expo/vector-icons';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as turf from '@turf/turf';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DestinationMarker } from './components/destination-marker';

// ─── Types ───────────────────────────────────────────────────
type FlowState = 'idle' | 'preview' | 'boarding' | 'transit' | 'complete';

// ─── Bus stop markers as GeoJSON ─────────────────────────────
function useBusStopGeoJSON() {
  const busStops = useBusStops();
  return useMemo(
    () =>
    ({
      type: 'FeatureCollection' as const,
      features: busStops
        .filter(s => s.status === 'approved')
        .map((s) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [s.longitude, s.latitude],
          },
          properties: { id: s.id, name: s.name, status: s.status },
        })),
    }),
    [busStops],
  );
}

// ─── Route lines GeoJSON builder ─────────────────────────────
function useRouteGeoJSON(
  routePlan: RoutePlan | null,
  userLat: number | null,
  userLng: number | null,
  destLat: number | null,
  destLng: number | null,
) {
  return useMemo(() => {
    if (!routePlan || userLat == null || userLng == null) return null;

    // Walk to origin (dotted gray)
    const walkToOrigin = {
      type: 'Feature' as const,
      properties: { segment: 'walk-to' },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [userLng, userLat],
          [routePlan.originStop.longitude, routePlan.originStop.latitude],
        ],
      },
    };

    // Transit route (thick purple)
    const transitCoords = routePlan.transitStops.map((s) => [
      s.longitude,
      s.latitude,
    ]);
    const transit = {
      type: 'Feature' as const,
      properties: { segment: 'transit' },
      geometry: {
        type: 'LineString' as const,
        coordinates: transitCoords,
      },
    };

    // Walk from destination (dotted gray)
    const walkFromDest = {
      type: 'Feature' as const,
      properties: { segment: 'walk-from' },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [
            routePlan.destinationStop.longitude,
            routePlan.destinationStop.latitude,
          ],
          [destLng ?? routePlan.destinationStop.longitude, destLat ?? routePlan.destinationStop.latitude],
        ],
      },
    };

    return {
      type: 'FeatureCollection' as const,
      features: [walkToOrigin, transit, walkFromDest],
    };
  }, [routePlan, userLat, userLng, destLat, destLng]);
}

// ─── Main Screen ─────────────────────────────────────────────
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cameraRef = useRef<MapLibreGL.CameraRef>(null);
  const hasCenteredOnUser = useRef(false);
  const { user } = useAuth();

  // Location
  const { coords, startWatching, stopWatching } = useUserLocation();
  const [locationName, setLocationName] = useState<string | null>(null);

  // Search
  const { results, search, isSearching, clearResults, getNearbyStops, setUserCoords } = useOfflineSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [destination, setDestination] = useState<SearchResult | null>(null);
  const [destinationInfoOpen, setDestinationInfoOpen] = useState(false);

  // Routing
  const { routePlan, isCalculating, calculateRoute, clearRoute } =
    useOfflineRouting();

  // Trip
  const { activeTrip, startTrip, updateStatus, sendPing } = useTrip(user?.id);

  // UI state machine
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [distanceToOrigin, setDistanceToOrigin] = useState<number | null>(null);

  // Add Bus Stop State
  const [longPressCoords, setLongPressCoords] = useState<number[] | null>(null);

  const handleMapLongPress = useCallback((event: any) => {
    if (flowState === 'idle' && event?.geometry?.coordinates) {
      setLongPressCoords(event.geometry.coordinates as number[]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [flowState]);

  // Bus stop markers
  const busStopGeoJSON = useBusStopGeoJSON();

  // Sync user coordinates into the search hook for distance calculations
  useEffect(() => {
    if (coords) {
      setUserCoords(coords.latitude, coords.longitude);
    }
  }, [coords, setUserCoords]);

  // Nearby stops for recommendations
  const nearbyStops = useMemo(() => {
    if (!coords) return [];
    return getNearbyStops(coords.latitude, coords.longitude, 6);
  }, [coords, getNearbyStops]);

  // Route lines
  const routeGeoJSON = useRouteGeoJSON(
    routePlan,
    coords?.latitude ?? null,
    coords?.longitude ?? null,
    destination?.latitude ?? null,
    destination?.longitude ?? null,
  );

  // Destination point marker
  const destinationGeoJSON = useMemo(() => {
    if (!destination) return null;
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [destination.longitude, destination.latitude],
          },
          properties: { id: destination.id },
        },
      ],
    };
  }, [destination]);

  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1 - (pulseScale.value - 1) * 0.65,
  }));

  const destinationLabel = useMemo(() => {
    if (!destination) return '';
    const text = destination.address || destination.name;
    return text.length > 45 ? `${text.slice(0, 45).trim()}...` : text;
  }, [destination]);

  useEffect(() => {
    if (destination) {
      setDestinationInfoOpen(false);
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.85, { duration: 1100 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        false,
      );
    } else {
      pulseScale.value = 1;
      setDestinationInfoOpen(false);
    }
  }, [destination, pulseScale]);

  const centerCameraOn = useCallback(
    (lat: number, lng: number, zoom = 15) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [lng, lat],
        zoomLevel: zoom,
        pitch: DEFAULT_PITCH,
        heading: DEFAULT_BEARING,
        animationDuration: 650,
      });
    },
    [],
  );

  // ─── Search handlers ────────────────────────────────
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      search(text);
    },
    [search],
  );

  const handleSelectResult = useCallback(
    async (result: SearchResult) => {
      setDestination(result);
      setIsSearchOpen(false);
      setSearchQuery(result.name);
      clearResults();
      Keyboard.dismiss();

      // center the camera on selected destination but do not restrict navigation.
      centerCameraOn(result.latitude, result.longitude, 16);
      setDestinationInfoOpen(true);

      if (!coords) return;

      const plan = await calculateRoute(
        coords.latitude,
        coords.longitude,
        result.latitude,
        result.longitude,
      );

      if (plan) {
        setFlowState('preview');
        // Keep route visible; no forced camera fit to bounds.
        // fitCameraToBounds(plan);
      }
    },
    [coords, calculateRoute, clearResults],
  );

  const fitCameraToBounds = useCallback(
    (plan: RoutePlan) => {
      if (!coords) return;
      const points = [
        [coords.longitude, coords.latitude],
        [plan.originStop.longitude, plan.originStop.latitude],
        ...plan.transitStops.map((s) => [s.longitude, s.latitude]),
        [plan.destinationStop.longitude, plan.destinationStop.latitude],
      ];
      const bbox = turf.bbox(turf.lineString(points));
      cameraRef.current?.fitBounds(
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
        [80, 80, 300, 80],
        1200,
      );
    },
    [coords],
  );

  // ─── Trip flow handlers ─────────────────────────────
  const handleStartJourney = useCallback(async () => {
    if (!routePlan || !user?.id) return;
    await startTrip({
      route_id: routePlan.route.id,
      origin_stop_id: routePlan.originStop.id,
      destination_stop_id: routePlan.destinationStop.id,
    });
    setFlowState('boarding');
    await startWatching();
  }, [routePlan, user, startTrip, startWatching]);

  const handleBoarding = useCallback(async () => {
    await updateStatus('in_transit');
    setFlowState('transit');
  }, [updateStatus]);

  const handleCancel = useCallback(() => {
    clearRoute();
    setDestination(null);
    setFlowState('idle');
    stopWatching();

    // Recenter camera
    if (coords) {
      cameraRef.current?.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
        animationDuration: 800,
      });
    }
  }, [clearRoute, stopWatching, coords]);

  const handleTripDismiss = useCallback(() => {
    handleCancel();
    setFlowState('idle');
  }, [handleCancel]);

  const handleRecenter = useCallback(() => {
    if (!coords) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [coords.longitude, coords.latitude],
      zoomLevel: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      animationDuration: 600,
    });
  }, [coords]);

  // ─── Distance monitoring ────────────────────────────
  useEffect(() => {
    if (!coords || !routePlan) return;

    if (flowState === 'boarding') {
      const d = turf.distance(
        turf.point([coords.longitude, coords.latitude]),
        turf.point([
          routePlan.originStop.longitude,
          routePlan.originStop.latitude,
        ]),
        { units: 'meters' },
      );
      setDistanceToOrigin(Math.round(d));
    }

    if (flowState === 'transit') {
      const d = turf.distance(
        turf.point([coords.longitude, coords.latitude]),
        turf.point([
          routePlan.destinationStop.longitude,
          routePlan.destinationStop.latitude,
        ]),
        { units: 'meters' },
      );

      // Auto-checkout when within geofence
      if (d <= GEOFENCE_RADIUS_METERS) {
        updateStatus('completed').then(() => {
          stopWatching();
          setFlowState('complete');
        });
      }

      // Send ping
      sendPing({
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: coords.speed,
        heading: coords.heading,
      } as any).catch(() => { });
    }
  }, [coords, routePlan, flowState]);

  // ─── Auto-center on user location once ──────────────
  useEffect(() => {
    if (coords && !hasCenteredOnUser.current) {
      hasCenteredOnUser.current = true;
      cameraRef.current?.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
        animationDuration: 1000,
      });
    }
  }, [coords]);

  // ─── Reverse geocode user location ──────────────────
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    const fetchName = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&zoom=18&addressdetails=1`,
          { headers: { 'User-Agent': 'Komiota/1.0' } },
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        const addr = data.address;
        const name = addr?.road || addr?.neighbourhood || addr?.suburb || data.display_name?.split(',').slice(0, 2).join(',') || null;
        setLocationName(name);
      } catch {
        // Silently fail — card will show fallback
      }
    };
    fetchName();
    return () => { cancelled = true; };
  }, [coords?.latitude?.toFixed(3), coords?.longitude?.toFixed(3)]);

  return (
    <View className="flex-1">
      {/* ═══ MAP ═══ */}
      <MapLibreGL.MapView
        style={StyleSheet.absoluteFillObject}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        mapStyle={MAP_STYLE_URL}
        onLongPress={handleMapLongPress}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: CEBU_CENTER,
            zoomLevel: DEFAULT_ZOOM,
            pitch: DEFAULT_PITCH,
            heading: DEFAULT_BEARING,
          }}
          followUserLocation={false}
        />

        {/* User location */}
        <MapLibreGL.UserLocation visible animated renderMode="native" />

        {/* 3D Buildings */}
        <MapLibreGL.FillExtrusionLayer
          id="3d-buildings"
          sourceID="openmaptiles"
          sourceLayerID="building"
          minZoomLevel={14}
          style={{
            fillExtrusionColor: BUILDING_COLOR,
            fillExtrusionHeight: ['get', 'render_height'],
            fillExtrusionBase: ['get', 'render_min_height'],
            fillExtrusionOpacity: 0.7,
          }}
        />

        {/* Bus stop markers */}
        <MapLibreGL.ShapeSource id="bus-stops-source" shape={busStopGeoJSON}>
          <MapLibreGL.CircleLayer
            id="bus-stops-circles"
            minZoomLevel={12}
            style={{
              circleRadius: 5,
              circleColor: colors.primary.DEFAULT,
              circleStrokeColor: '#fff',
              circleStrokeWidth: 2,
              circleOpacity: 0.85,
            }}
          />
        </MapLibreGL.ShapeSource>

        <DestinationMarker
          destination={destination}
          destinationInfoOpen={destinationInfoOpen}
          setDestinationInfoOpen={setDestinationInfoOpen}
        />

        {/* Route lines */}
        {routeGeoJSON && (
          <MapLibreGL.ShapeSource id="route-source" shape={routeGeoJSON}>
            {/* Walk to origin (dotted gray) */}
            <MapLibreGL.LineLayer
              id="walk-to-line"
              filter={['==', ['get', 'segment'], 'walk-to']}
              style={{
                lineColor: '#9E9E9E',
                lineWidth: 3,
                lineDasharray: [2, 3],
                lineCap: 'round',
              }}
            />
            {/* Transit route (thick purple glow) */}
            <MapLibreGL.LineLayer
              id="transit-line-glow"
              filter={['==', ['get', 'segment'], 'transit']}
              belowLayerID="transit-line"
              style={{
                lineColor: colors.text.dark,
                lineWidth: 10,
                lineBlur: 8,
                lineOpacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <MapLibreGL.LineLayer
              id="transit-line"
              filter={['==', ['get', 'segment'], 'transit']}
              style={{
                lineColor: colors.primary.DEFAULT,
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Walk from dest (dotted gray) */}
            <MapLibreGL.LineLayer
              id="walk-from-line"
              filter={['==', ['get', 'segment'], 'walk-from']}
              style={{
                lineColor: '#9E9E9E',
                lineWidth: 3,
                lineDasharray: [2, 3],
                lineCap: 'round',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {/* ═══ SEARCH OVERLAY (idle state) ═══ */}
      {flowState === 'idle' && (
        <>
          {/* Search bar */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="absolute left-5 right-5"
            style={{ top: insets.top + 20 }}
          >
            <View
              className="flex-row items-center rounded-pill px-5 py-4"
              style={{
                backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(90, 59, 207, 0.3)' : 'transparent',
                shadowColor: isDark ? '#000' : colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Ionicons
                name="search"
                size={20}
                color={isDark ? colors.text.dark : colors.text.DEFAULT}
              />
              <TextInput
                className="flex-1 ml-3"
                style={{
                  color: isDark ? colors.text.dark : colors.text.DEFAULT,
                  paddingVertical: 0,
                  fontSize: 16,
                }}
                placeholder="Where are you going?"
                placeholderTextColor={isDark ? colors.text.darkMuted : colors.text.muted}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={() => setIsSearchOpen(true)}
                returnKeyType="search"
              />
              <Pressable
                onPress={() => setIsSearchOpen(true)}
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary.DEFAULT }}
              >
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Current location card */}
          {coords && (
            <Animated.View
              entering={FadeInUp.delay(200).duration(400)}
              className="absolute left-5"
              style={{ bottom: insets.bottom + 100 }}
            >
              <View
                className="flex-row items-center rounded-card px-4 py-3"
                style={{
                  backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? 'rgba(90, 59, 207, 0.2)' : 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-2.5" style={{ backgroundColor: colors.primary.DEFAULT + '20' }}>
                  <Ionicons name="navigate" size={16} color={isDark ? colors.text.dark : colors.primary.DEFAULT} />
                </View>
                <View style={{ maxWidth: 160 }}>
                  <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 10, fontWeight: '500' }}>
                    Your location
                  </Text>
                  <Text style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
                    {locationName || 'Locating...'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          <View
            className="absolute right-5"
            style={{ bottom: insets.bottom + 160 }}
          >
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Add a Bus Stop',
                  'To add a new bus stop to the map, simply press and hold anywhere on the map!'
                );
              }}
              className="w-12 h-12 rounded-full items-center justify-center active:opacity-80"
              style={{
                backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(90, 59, 207, 0.25)' : 'transparent',
                shadowColor: isDark ? '#000' : colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons
                name="information-circle"
                size={22}
                color={isDark ? colors.text.dark : colors.primary.DEFAULT}
              />
            </Pressable>
          </View>

          {/* Recenter FAB */}
          <View
            className="absolute right-5"
            style={{ bottom: insets.bottom + 100 }}
          >
            <Pressable
              onPress={handleRecenter}
              className="w-12 h-12 rounded-full items-center justify-center active:opacity-80"
              style={{
                backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(90, 59, 207, 0.25)' : 'transparent',
                shadowColor: isDark ? '#000' : colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons
                name="locate"
                size={22}
                color={isDark ? colors.text.dark : colors.primary.DEFAULT}
              />
            </Pressable>
          </View>
        </>
      )}

      {/* ═══ ROUTE PREVIEW / BOARDING / TRANSIT ═══ */}
      {(flowState === 'preview' ||
        flowState === 'boarding' ||
        flowState === 'transit') && (
          <>
            {/* Back button */}
            <Animated.View
              entering={FadeIn.duration(300)}
              className="absolute"
              style={{ top: insets.top + 12, left: 20 }}
            >
              <Pressable
                onPress={handleCancel}
                className="w-10 h-10 bg-surface dark:bg-surface-dark rounded-full items-center justify-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={isDark ? colors.text.dark : colors.text.DEFAULT}
                />
              </Pressable>
            </Animated.View>

            {/* Route info pill */}
            {routePlan && (
              <Animated.View
                entering={FadeInDown.delay(200).duration(400)}
                className="absolute self-center"
                style={{ top: insets.top + 12 }}
              >
                <View className="bg-surface dark:bg-surface-dark rounded-pill px-5 py-2.5 flex-row items-center shadow-lg shadow-primary/10">
                  <Ionicons
                    name="bus"
                    size={16}
                    color={colors.primary.DEFAULT}
                  />
                  <Text className="text-text dark:text-text-dark font-semibold text-sm ml-2">
                    {routePlan.transitStops.length} stops
                  </Text>
                </View>
              </Animated.View>
            )}

            <RouteBottomSheet
              state={flowState}
              routePlan={routePlan}
              distanceToOrigin={distanceToOrigin}
              onStartJourney={handleStartJourney}
              onBoarding={handleBoarding}
              onCancel={handleCancel}
              isLoading={isCalculating}
            />
          </>
        )}

      {/* ═══ SEARCH FULLSCREEN OVERLAY ═══ */}
      {isSearchOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 z-50"
          style={{ backgroundColor: isDark ? colors.background.dark : colors.background.DEFAULT }}
        >
          {/* Search bar — matches idle bar style */}
          <View
            className="px-5"
            style={{ paddingTop: insets.top + 20, paddingBottom: 16 }}
          >
            <View
              className="flex-row items-center rounded-pill px-5 py-2"
              style={{
                backgroundColor: isDark ? colors.surface.dark : colors.surface.DEFAULT,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(90, 59, 207, 0.3)' : 'transparent',
                shadowColor: isDark ? '#000' : colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Pressable
                onPress={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  clearResults();
                }}
                className="mr-2"
                hitSlop={8}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={isDark ? colors.text.dark : colors.text.DEFAULT}
                />
              </Pressable>
              <TextInput
                className="flex-1 text-base"
                style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT }}
                placeholder="Where are you going?"
                placeholderTextColor={isDark ? colors.text.darkMuted : colors.text.muted}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoFocus
                returnKeyType="search"
              />
              {isSearching ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary.DEFAULT}
                />
              ) : (
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Ionicons name="search" size={16} color="#fff" />
                </View>
              )}
            </View>
          </View>

          <FlatList
            data={results.length > 0 ? results : (searchQuery.length < 2 ? nearbyStops : [])}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4 }}
            ListHeaderComponent={
              results.length === 0 && searchQuery.length < 2 && nearbyStops.length > 0 ? (
                <View className="pb-2 pt-2">
                  <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Nearby Stops
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item, index }) => {
              const distanceText = item.distanceKm != null
                ? item.distanceKm < 1
                  ? `${Math.round(item.distanceKm * 1000)} m`
                  : `${item.distanceKm.toFixed(1)} km`
                : null;
              const addressText = item.address
                || (item.source === 'local' ? 'Bus Stop' : 'Place');

              return (
                <Animated.View
                  entering={FadeInDown.delay(index * 50).duration(300)}
                >
                  <Pressable
                    onPress={() => handleSelectResult(item)}
                    className="flex-row items-center py-3.5"
                    style={{
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: isDark ? 'rgba(90, 59, 207, 0.15)' : 'rgba(70, 39, 182, 0.08)',
                    }}
                  >
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: colors.primary.DEFAULT + (isDark ? '25' : '15'),
                      }}
                    >
                      <Ionicons
                        name={
                          item.source === 'local' ? 'location' : 'globe-outline'
                        }
                        size={20}
                        color={colors.primary.DEFAULT}
                      />
                    </View>
                    <View className="flex-1" style={{ marginRight: 8 }}>
                      <Text
                        style={{ color: isDark ? colors.text.dark : colors.text.DEFAULT, fontWeight: '600', fontSize: 14 }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 12, marginTop: 2, lineHeight: 16 }}
                        numberOfLines={2}
                      >
                        {distanceText ? `${distanceText} · ` : ''}{addressText}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={isDark ? colors.text.darkMuted : colors.text.muted}
                    />
                  </Pressable>
                </Animated.View>
              );
            }}
            ListEmptyComponent={
              searchQuery.length >= 2 && !isSearching ? (
                <View className="items-center py-12">
                  <Ionicons
                    name="search-outline"
                    size={40}
                    color={isDark ? colors.text.darkMuted : colors.text.muted}
                  />
                  <Text style={{ color: isDark ? colors.text.darkMuted : colors.text.muted, fontSize: 14, marginTop: 12 }}>
                    No results found
                  </Text>
                </View>
              ) : null
            }
          />
        </Animated.View>
      )}

      {/* ═══ ADD BUS STOP BOTTOM SHEET ═══ */}
      {longPressCoords && (
        <AddBusStopBottomSheet
          coordinate={longPressCoords}
          onClose={() => setLongPressCoords(null)}
          onSuccess={() => setLongPressCoords(null)}
        />
      )}

      {/* ═══ CALCULATING OVERLAY ═══ */}
      {isCalculating && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 items-center justify-center z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <View className="bg-surface dark:bg-surface-dark rounded-card px-8 py-6 items-center shadow-lg">
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text className="text-text dark:text-text-dark font-semibold text-sm mt-3">
              Calculating route...
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ═══ TRIP COMPLETE MODAL ═══ */}
      <TripCompleteModal
        visible={flowState === 'complete'}
        onDismiss={handleTripDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  destinationPulse: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(137,92,154,0.22)',
  },
  destinationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    borderColor: '#fff',
    borderWidth: 2,
  },
  destinationAnnotationContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationBubbleWrapper: {
    position: 'absolute',
    bottom: 52,
    left: -80,
    width: 200,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  destinationBubbleVisible: {
    opacity: 1,
  },
  destinationBubbleHidden: {
    opacity: 0,
  },
  destinationBubble: {
    maxWidth: 190,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(44,39,63,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  destinationBubbleTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2,
  },
  destinationBubbleText: {
    color: '#EAEAFB',
    fontSize: 11,
    marginBottom: 4,
  },
  destinationBubbleHint: {
    color: '#BEBDE7',
    fontSize: 10,
    marginTop: 2,
  },
});