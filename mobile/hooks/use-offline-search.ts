import { useState, useCallback, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
import { useBusStops } from './use-bus-stops';

export interface SearchResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  source: 'local' | 'nominatim';
  distanceKm?: number;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const CEBU_VIEWBOX = '123.6,9.8,124.1,10.6';

/** Haversine distance in km */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Two-tier offline-first search:
 * 1. Instant: Fuse.js fuzzy search over local WatermelonDB bus stops
 * 2. Fallback: Nominatim geocoding API (debounced, Cebu-bounded)
 */
export function useOfflineSearch() {
  const busStops = useBusStops();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build Fuse index reactively when bus stops change
  const fuse = useMemo(() => {
    const items = busStops.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    return new Fuse(items, {
      keys: ['name'],
      threshold: 0.35,
      distance: 100,
    });
  }, [busStops]);

  /** Get nearby bus stops sorted by distance from user */
  const getNearbyStops = useCallback(
    (userLat: number, userLng: number, limit = 6): SearchResult[] => {
      return busStops
        .map((s) => ({
          id: s.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          source: 'local' as const,
          distanceKm: haversine(userLat, userLng, s.latitude, s.longitude),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit);
    },
    [busStops],
  );

  const search = useCallback(
    (query: string) => {
      if (!query || query.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // 1. Local results (instant)
      const localMatches = fuse.search(query, { limit: 5 }).map((r) => ({
        ...r.item,
        source: 'local' as const,
      }));

      setResults(localMatches);

      // 2. Online fallback (debounced) — only if few local results
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (localMatches.length < 3) {
        debounceRef.current = setTimeout(async () => {
          try {
            const params = new URLSearchParams({
              q: query,
              format: 'json',
              viewbox: CEBU_VIEWBOX,
              bounded: '1',
              limit: '5',
              addressdetails: '0',
            });
            const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
              headers: { 'User-Agent': 'Komiota/1.0' },
            });
            if (!res.ok) return;

            const data: Array<{
              place_id: number;
              display_name: string;
              lat: string;
              lon: string;
            }> = await res.json();

            const nominatimResults: SearchResult[] = data.map((d) => ({
              id: `nom-${d.place_id}`,
              name: d.display_name.split(',').slice(0, 2).join(','),
              latitude: parseFloat(d.lat),
              longitude: parseFloat(d.lon),
              source: 'nominatim',
            }));

            // Merge: local first, then nominatim (deduplicated)
            const localIds = new Set(localMatches.map((m) => m.id));
            const merged = [
              ...localMatches,
              ...nominatimResults.filter((r) => !localIds.has(r.id)),
            ];
            setResults(merged);
          } catch {
            // Offline — silently keep local results
          } finally {
            setIsSearching(false);
          }
        }, 500);
      } else {
        setIsSearching(false);
      }
    },
    [fuse],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setIsSearching(false);
  }, []);

  return { results, search, isSearching, clearResults, getNearbyStops };
}
