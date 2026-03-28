import { useState, useEffect, useCallback } from 'react';
import type { Tables } from '../lib/types';
import { getPendingBusStops, updateBusStopStatus, deleteBusStop } from '../services/bus-stops';

export function usePendingStops() {
  const [pendingStops, setPendingStops] = useState<Tables<'bus_stops'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchStops = useCallback(async () => {
    try {
      const data = await getPendingBusStops();
      setPendingStops(data);
    } catch (error) {
      console.error('Failed to fetch pending stops', error);
      throw error;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStops();
  }, [fetchStops]);

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActioningId(id);
    try {
      await updateBusStopStatus(id, newStatus);
      setPendingStops((prev) => prev.filter((stop) => stop.id !== id));
    } finally {
      setActioningId(null);
    }
  };

  const removeStop = async (id: string) => {
    setActioningId(id);
    try {
      await deleteBusStop(id);
      setPendingStops((prev) => prev.filter((stop) => stop.id !== id));
    } finally {
      setActioningId(null);
    }
  };

  return {
    pendingStops,
    loading,
    refreshing,
    actioningId,
    refresh,
    updateStatus,
    removeStop,
  };
}
