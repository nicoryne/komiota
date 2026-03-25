import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/types';

export async function getRoutes(): Promise<Tables<'routes'>[]> {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getRouteWithStops(routeId: string) {
  const { data, error } = await supabase
    .from('routes')
    .select(`
      *,
      route_stops (
        id,
        order_index,
        bus_stops (*)
      )
    `)
    .eq('id', routeId)
    .single();

  if (error) throw error;

  // Sort stops by order_index for correct sequence
  if (data.route_stops) {
    data.route_stops.sort(
      (a: { order_index: number }, b: { order_index: number }) =>
        a.order_index - b.order_index,
    );
  }

  return data;
}
