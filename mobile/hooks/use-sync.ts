import { useState, useCallback } from 'react';
import { syncDatabase } from '../db/sync';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      await syncDatabase();
      setLastSyncedAt(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { sync, isSyncing, lastSyncedAt, error };
}
