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
  address?: string;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
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

/** Build a readable address string from Nominatim address components */
function buildAddress(addr: Record<string, string>): string {
  const parts: string[] = [];
  // Street / road
  if (addr.road) parts.push(addr.road);
  // Neighbourhood / suburb / village
  if (addr.neighbourhood) parts.push(addr.neighbourhood);
  else if (addr.suburb) parts.push(addr.suburb);
  else if (addr.village) parts.push(addr.village);
  // City
  if (addr.city) parts.push(addr.city);
  else if (addr.town) parts.push(addr.town);
  else if (addr.municipality) parts.push(addr.municipality);
  // Province / state
  if (addr.state) parts.push(addr.state);
  // Country
  if (addr.country) parts.push(addr.country);
  return parts.join(', ');
}

// Simple in-memory cache for reverse-geocoded addresses
const addressCache = new Map<string, string>();

/** Reverse geocode a coordinate to get a human-readable address */
async function reverseGeocode(lat: number, lon: number): Promise<string | undefined> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (addressCache.has(cacheKey)) return addressCache.get(cacheKey);

  try {
    const res = await fetch(
      `${NOMINATIM_REVERSE}?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'Komiota/1.0' } },
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    if (data.address) {
      const addr = buildAddress(data.address);
      addressCache.set(cacheKey, addr);
      return addr;
    }
    if (data.display_name) {
      addressCache.set(cacheKey, data.display_name);
      return data.display_name;
    }
  } catch {
    // Offline — no address
  }
  return undefined;
}

/**
 * Two-tier offline-first search with smart fuzzy matching:
 * 1. Instant: Fuse.js fuzzy search over local WatermelonDB bus stops
 * 2. Fallback: Nominatim geocoding API (debounced, Cebu-bounded)
 *
 * Results include distance from user and reverse-geocoded addresses.
 */
export function useOfflineSearch() {
  const busStops = useBusStops();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Build Fuse index reactively when bus stops change
  // Increased fuzziness: threshold 0.5, distance 200, ignoreLocation for smarter matching
  const fuse = useMemo(() => {
    const items = busStops.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    return new Fuse(items, {
      keys: ['name'],
      threshold: 0.5,
      distance: 200,
      ignoreLocation: true,
      minMatchCharLength: 2,
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

  /** Set user coordinates for distance calculations */
  const setUserCoords = useCallback((lat: number, lng: number) => {
    userCoordsRef.current = { lat, lng };
  }, []);

  const search = useCallback(
    (query: string) => {
      if (!query || query.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      const userCoords = userCoordsRef.current;

      // 1. Local results (instant) — enhanced with distance
      const localMatches: SearchResult[] = fuse.search(query, { limit: 5 }).map((r) => ({
        ...r.item,
        source: 'local' as const,
        distanceKm: userCoords
          ? haversine(userCoords.lat, userCoords.lng, r.item.latitude, r.item.longitude)
          : undefined,
      }));

      setResults(localMatches);

      // Enrich local results with reverse-geocoded addresses (async, non-blocking)
      if (localMatches.length > 0) {
        Promise.all(
          localMatches.map(async (match) => {
            const addr = await reverseGeocode(match.latitude, match.longitude);
            return { ...match, address: addr };
          }),
        ).then((enriched) => {
          // Only update if we're still showing these results
          setResults((current) => {
            // Check if the local results are still the base (no Nominatim merge yet or still same query)
            const localIds = new Set(localMatches.map((m) => m.id));
            return current.map((r) => {
              if (localIds.has(r.id)) {
                const enrichedItem = enriched.find((e) => e.id === r.id);
                return enrichedItem || r;
              }
              return r;
            });
          });
        });
      }

      // 2. Online fallback (debounced) — always fetch for richer results
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({
            q: query,
            format: 'json',
            viewbox: CEBU_VIEWBOX,
            bounded: '1',
            limit: '5',
            addressdetails: '1',
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
            address?: Record<string, string>;
          }> = await res.json();

          const nominatimResults: SearchResult[] = data.map((d) => {
            const lat = parseFloat(d.lat);
            const lon = parseFloat(d.lon);
            return {
              id: `nom-${d.place_id}`,
              name: d.display_name.split(',').slice(0, 2).join(',').trim(),
              latitude: lat,
              longitude: lon,
              source: 'nominatim',
              distanceKm: userCoords
                ? haversine(userCoords.lat, userCoords.lng, lat, lon)
                : undefined,
              address: d.address ? buildAddress(d.address) : d.display_name,
            };
          });

          // Merge: local first, then nominatim (deduplicated)
          setResults((currentLocal) => {
            const localIds = new Set(currentLocal.filter((r) => r.source === 'local').map((m) => m.id));
            return [
              ...currentLocal.filter((r) => r.source === 'local'),
              ...nominatimResults.filter((r) => !localIds.has(r.id)),
            ];
          });
        } catch {
          // Offline — silently keep local results
        } finally {
          setIsSearching(false);
        }
      }, 500);
    },
    [fuse],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setIsSearching(false);
  }, []);

  return { results, search, isSearching, clearResults, getNearbyStops, setUserCoords };
}
