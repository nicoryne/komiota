import { useState, useEffect } from 'react';
import { database } from '../db';
import BusStop from '../db/models/BusStop';

/**
 * Observes all bus stops from the local WatermelonDB for reactive offline rendering.
 */
export function useBusStops() {
  const [busStops, setBusStops] = useState<BusStop[]>([]);

  useEffect(() => {
    const subscription = database
      .get<BusStop>('bus_stops')
      .query()
      .observe()
      .subscribe((data) => setBusStops(data));

    return () => subscription.unsubscribe();
  }, []);

  return busStops;
}
