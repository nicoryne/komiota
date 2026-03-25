import { useState, useEffect, useCallback } from 'react';
import type { Tables } from '../lib/types';
import * as profileService from '../services/profiles';

export function useLeaderboard(limit = 25) {
  const [leaderboard, setLeaderboard] = useState<Tables<'profiles'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getLeaderboard(limit);
      setLeaderboard(data);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { leaderboard, isLoading, refetch: fetch };
}
