import { supabase } from '../lib/supabase';
import type { Tables, InsertDto } from '../lib/types';
import { busStopSubmitSchema } from '../lib/schemas';

interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/**
 * Fetches bus stops within a bounding box using the PostGIS RPC function.
 */
export async function getBusStopsInBBox(bbox: BoundingBox) {
  const { data, error } = await supabase.rpc('get_bus_stops_in_bbox', {
    min_lon: bbox.minLon,
    min_lat: bbox.minLat,
    max_lon: bbox.maxLon,
    max_lat: bbox.maxLat,
  });

  if (error) throw error;
  return data;
}

/**
 * Fetches bus stops near a point within a given radius (meters).
 * Uses PostGIS ST_DWithin via a raw filter.
 */
export async function getNearbyStops(
  lat: number,
  lng: number,
  radiusMeters = 500,
): Promise<Tables<'bus_stops'>[]> {
  const point = `SRID=4326;POINT(${lng} ${lat})`;
  const { data, error } = await supabase
    .from('bus_stops')
    .select('*')
    .filter(
      'location',
      'st_dwithin',
      `${point},${radiusMeters}`,
    );

  if (error) throw error;
  return data ?? [];
}

/**
 * Submits a user-contributed bus stop (status defaults to 'pending' server-side).
 * Validates input via Zod before sending — rejects coordinates outside Cebu City.
 */
export async function submitBusStop(
  input: { name: string; latitude: number; longitude: number; image_url?: string | null; created_by: string },
): Promise<Tables<'bus_stops'>> {
  const validated = busStopSubmitSchema.parse(input);

  const { data, error } = await supabase
    .from('bus_stops')
    .insert({
      name: validated.name,
      location: `SRID=4326;POINT(${validated.longitude} ${validated.latitude})`,
      image_url: validated.image_url ?? null,
      created_by: input.created_by,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
