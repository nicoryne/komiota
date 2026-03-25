import { useState, useCallback } from 'react';
import * as turf from '@turf/turf';
import { database } from '../db';
import BusStop from '../db/models/BusStop';
import RouteStop from '../db/models/RouteStop';
import Route from '../db/models/Route';
import { useBusStops } from './use-bus-stops';
import { WALKING_SPEED_KMH } from '../lib/map-config';

export interface RoutePlan {
  originStop: { id: string; name: string; latitude: number; longitude: number };
  destinationStop: { id: string; name: string; latitude: number; longitude: number };
  route: { id: string; name: string; pointMultiplier: number };
  /** Ordered bus stops along this route segment */
  transitStops: Array<{ id: string; name: string; latitude: number; longitude: number }>;
  walkToOriginKm: number;
  walkToOriginMin: number;
  walkFromDestKm: number;
  walkFromDestMin: number;
}

/**
 * Offline routing using Turf.js:
 * 1. Find nearest bus stop to user GPS (origin).
 * 2. Find nearest bus stop to destination coords.
 * 3. Find a connecting route between those stops.
 * 4. Build the ordered stop sequence for the segment.
 */
export function useOfflineRouting() {
  const busStops = useBusStops();
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(
    async (
      userLat: number,
      userLng: number,
      destLat: number,
      destLng: number,
    ) => {
      if (busStops.length === 0) {
        setError('No bus stops available offline');
        return null;
      }

      setIsCalculating(true);
      setError(null);

      try {
        // Build GeoJSON FeatureCollection from bus stops
        const stopFeatures = turf.featureCollection(
          busStops.map((s) =>
            turf.point([s.longitude, s.latitude], {
              id: s.id,
              name: s.name,
              latitude: s.latitude,
              longitude: s.longitude,
            }),
          ),
        );

        // 1. Nearest stop to user (origin)
        const userPoint = turf.point([userLng, userLat]);
        const nearestOrigin = turf.nearestPoint(userPoint, stopFeatures);

        // 2. Nearest stop to destination
        const destPoint = turf.point([destLng, destLat]);
        const nearestDest = turf.nearestPoint(destPoint, stopFeatures);

        const originId = nearestOrigin.properties?.id;
        const destId = nearestDest.properties?.id;

        if (!originId || !destId || originId === destId) {
          setError('Could not find a valid route between those locations');
          setIsCalculating(false);
          return null;
        }

        // 3. Find a route connecting both stops via route_stops table
        const originRouteStops = await database
          .get<RouteStop>('route_stops')
          .query()
          .fetch();

        // Group route_stops by route_id
        const routeMap = new Map<string, RouteStop[]>();
        for (const rs of originRouteStops) {
          const routeId = (rs as any)._raw.route_id;
          const existing = routeMap.get(routeId) ?? [];
          existing.push(rs);
          routeMap.set(routeId, existing);
        }

        // Find a route that contains both origin and dest stops
        let matchedRouteId: string | null = null;
        let matchedStops: RouteStop[] = [];

        for (const [routeId, stops] of routeMap) {
          const stopIds = stops.map((s) => (s as any)._raw.stop_id);
          if (stopIds.includes(originId) && stopIds.includes(destId)) {
            matchedRouteId = routeId;
            matchedStops = stops.sort(
              (a, b) => a.orderIndex - b.orderIndex,
            );
            break;
          }
        }

        if (!matchedRouteId) {
          setError('No transit route found connecting those stops');
          setIsCalculating(false);
          return null;
        }

        // 4. Get route details
        const routeRecord = await database
          .get<Route>('routes')
          .find(matchedRouteId);

        // 5. Build ordered transit stops for the segment
        const originIdx = matchedStops.findIndex(
          (s) => (s as any)._raw.stop_id === originId,
        );
        const destIdx = matchedStops.findIndex(
          (s) => (s as any)._raw.stop_id === destId,
        );
        const [startIdx, endIdx] =
          originIdx < destIdx
            ? [originIdx, destIdx]
            : [destIdx, originIdx];

        const segmentStops = matchedStops.slice(startIdx, endIdx + 1);

        // Resolve bus stop details for segment
        const transitStops: RoutePlan['transitStops'] = [];
        for (const rs of segmentStops) {
          const stopId = (rs as any)._raw.stop_id;
          const stop = busStops.find((s) => s.id === stopId);
          if (stop) {
            transitStops.push({
              id: stop.id,
              name: stop.name,
              latitude: stop.latitude,
              longitude: stop.longitude,
            });
          }
        }

        // 6. Calculate walking distances
        const walkToOriginKm = turf.distance(userPoint, nearestOrigin, {
          units: 'kilometers',
        });
        const walkFromDestKm = turf.distance(destPoint, nearestDest, {
          units: 'kilometers',
        });

        const plan: RoutePlan = {
          originStop: nearestOrigin.properties as any,
          destinationStop: nearestDest.properties as any,
          route: {
            id: matchedRouteId,
            name: routeRecord.name,
            pointMultiplier: routeRecord.pointMultiplier,
          },
          transitStops,
          walkToOriginKm,
          walkToOriginMin: Math.ceil(
            (walkToOriginKm / WALKING_SPEED_KMH) * 60,
          ),
          walkFromDestKm,
          walkFromDestMin: Math.ceil(
            (walkFromDestKm / WALKING_SPEED_KMH) * 60,
          ),
        };

        setRoutePlan(plan);
        return plan;
      } catch (err: any) {
        setError(err.message ?? 'Route calculation failed');
        return null;
      } finally {
        setIsCalculating(false);
      }
    },
    [busStops],
  );

  const clearRoute = useCallback(() => {
    setRoutePlan(null);
    setError(null);
  }, []);

  return { routePlan, isCalculating, error, calculateRoute, clearRoute };
}
