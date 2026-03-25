import { useState, useEffect, useCallback } from 'react';
import type { Tables, InsertDto, Enums } from '../lib/types';
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
      data: Pick<InsertDto<'user_trips'>, 'route_id' | 'origin_stop_id' | 'destination_stop_id'>,
    ) => {
      if (!userId) return;
      const trip = await tripService.startTrip({ ...data, profile_id: userId });
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
    async (ping: Omit<InsertDto<'trip_pings'>, 'trip_id'>) => {
      if (!activeTrip) return;
      await tripService.insertTripPing({ ...ping, trip_id: activeTrip.id });
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
