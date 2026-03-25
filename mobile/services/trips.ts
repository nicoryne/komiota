import { supabase } from '../lib/supabase';
import type { Tables, Enums } from '../lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { tripStartSchema, tripPingSchema } from '../lib/schemas';

// ─── Trip Lifecycle ──────────────────────────────────────────────

/**
 * Creates a new trip. Validates route/stop UUIDs via Zod before sending.
 */
export async function startTrip(
  input: { profile_id: string; route_id: string; origin_stop_id: string; destination_stop_id: string },
): Promise<Tables<'user_trips'>> {
  const validated = tripStartSchema.parse(input);

  const { data, error } = await supabase
    .from('user_trips')
    .insert({
      profile_id: input.profile_id,
      route_id: validated.route_id,
      origin_stop_id: validated.origin_stop_id,
      destination_stop_id: validated.destination_stop_id,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTripStatus(
  tripId: string,
  status: Enums<'trip_status'>,
): Promise<Tables<'user_trips'>> {
  const updates: Partial<Tables<'user_trips'>> = { status };

  if (status === 'completed' || status === 'cancelled') {
    updates.ended_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('user_trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveTrip(
  userId: string,
): Promise<Tables<'user_trips'> | null> {
  const { data, error } = await supabase
    .from('user_trips')
    .select('*')
    .eq('profile_id', userId)
    .in('status', ['waiting', 'in_transit'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserTripHistory(
  userId: string,
  page = 0,
  pageSize = 20,
): Promise<Tables<'user_trips'>[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('user_trips')
    .select('*')
    .eq('profile_id', userId)
    .order('started_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data;
}

// ─── Trip Pings ──────────────────────────────────────────────────

/**
 * Inserts a GPS ping for an active trip.
 * Validates coordinates and speed via Zod — rejects pings outside
 * Cebu City or exceeding 80 km/h.
 */
export async function insertTripPing(
  input: { trip_id: string; latitude: number; longitude: number; speed?: number | null; heading?: number | null },
): Promise<void> {
  const validated = tripPingSchema.parse(input);

  const { error } = await supabase.from('trip_pings').insert({
    trip_id: input.trip_id,
    location: `SRID=4326;POINT(${validated.longitude} ${validated.latitude})`,
    speed: validated.speed ?? null,
    heading: validated.heading ?? null,
  });
  if (error) throw error;
}

/**
 * Subscribes to live trip pings via Supabase Realtime.
 * Returns the channel so the caller can unsubscribe.
 */
export function subscribeToLivePings(
  routeId: string,
  onPing: (ping: Tables<'trip_pings'>) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`live-pings:${routeId}`)
    .on<Tables<'trip_pings'>>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_pings',
      },
      (payload) => {
        onPing(payload.new);
      },
    )
    .subscribe();

  return channel;
}
