import { useCallback, useEffect, useState } from 'react';
import type { Enums, Tables } from '../lib/types';
import * as tripService from '../services/trips';

export function useTrip(userId: string | undefined) {
  const [activeTrip, setActiveTrip] = useState<Tables<'user_trips'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveTrip = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const trip = await tripService.getActiveTrip(userId);
      setActiveTrip(trip);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActiveTrip();
  }, [fetchActiveTrip]);

  const startTrip = useCallback(
    async (
      data: {
        route_id: string;
        origin_stop_id: string;
        destination_stop_id: string;
      },
    ) => {
      if (!userId) return;
      const trip = await tripService.startTrip({
        route_id: data.route_id,
        origin_stop_id: data.origin_stop_id,
        destination_stop_id: data.destination_stop_id,
        profile_id: userId,
      });
      setActiveTrip(trip);
      return trip;
    },
    [userId],
  );

  const updateStatus = useCallback(
    async (status: Enums<'trip_status'>) => {
      if (!activeTrip) return;
      const updated = await tripService.updateTripStatus(activeTrip.id, status);
      setActiveTrip(status === 'completed' || status === 'cancelled' ? null : updated);
      return updated;
    },
    [activeTrip],
  );

  const sendPing = useCallback(
    async (ping: {
      latitude: number;
      longitude: number;
      speed?: number | null;
      heading?: number | null;
    }) => {
      if (!activeTrip) return;
      await tripService.insertTripPing({
        trip_id: activeTrip.id,
        latitude: ping.latitude,
        longitude: ping.longitude,
        speed: ping.speed,
        heading: ping.heading,
      });
    },
    [activeTrip],
  );

  return {
    activeTrip,
    isLoading,
    startTrip,
    updateStatus,
    sendPing,
    refetch: fetchActiveTrip,
  };
}
