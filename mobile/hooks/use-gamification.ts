import { useState, useEffect, useCallback } from 'react';
import type { Tables } from '../lib/types';
import * as gamificationService from '../services/gamification';

export function useGamification(userId: string | undefined) {
  const [factions, setFactions] = useState<Tables<'factions'>[]>([]);
  const [badges, setBadges] = useState<Tables<'badges'>[]>([]);
  const [userBadges, setUserBadges] = useState<
    Awaited<ReturnType<typeof gamificationService.getUserBadges>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [factionsData, badgesData, userBadgesData] = await Promise.all([
        gamificationService.getFactions(),
        gamificationService.getBadges(),
        userId ? gamificationService.getUserBadges(userId) : Promise.resolve([]),
      ]);
      setFactions(factionsData);
      setBadges(badgesData);
      setUserBadges(userBadgesData);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { factions, badges, userBadges, isLoading, refetch: fetchAll };
}
