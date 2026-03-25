import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

export interface UserCoords {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
}

interface UseUserLocationReturn {
  coords: UserCoords | null;
  isLoading: boolean;
  error: string | null;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
  isWatching: boolean;
}

/**
 * Wraps expo-location for foreground GPS tracking.
 * - On mount: requests permissions and gets a single fix.
 * - `startWatching` / `stopWatching`: for active trip tracking with pings.
 */
export function useUserLocation(): UseUserLocationReturn {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // Request permission + get initial fix
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setIsLoading(false);
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!cancelled) {
          setCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading: loc.coords.heading ?? null,
            speed: loc.coords.speed ?? null,
            accuracy: loc.coords.accuracy ?? null,
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Failed to get location');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const startWatching = useCallback(async () => {
    if (watchRef.current) return;

    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (loc) => {
        setCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          heading: loc.coords.heading ?? null,
          speed: loc.coords.speed ?? null,
          accuracy: loc.coords.accuracy ?? null,
        });
      },
    );
    watchRef.current = sub;
    setIsWatching(true);
  }, []);

  const stopWatching = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
    setIsWatching(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  return { coords, isLoading, error, startWatching, stopWatching, isWatching };
}
