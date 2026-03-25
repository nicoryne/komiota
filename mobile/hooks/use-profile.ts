import { useState, useEffect, useCallback } from 'react';
import type { Tables, UpdateDto } from '../lib/types';
import * as profileService from '../services/profiles';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await profileService.getProfile(userId);
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (
      updates: Pick<UpdateDto<'profiles'>, 'username' | 'avatar_url' | 'faction_id' | 'onboarding_completed'>,
    ) => {
      if (!userId) return;
      const updated = await profileService.updateProfile(userId, updates);
      setProfile(updated);
      return updated;
    },
    [userId],
  );

  return { profile, isLoading, error, updateProfile, refetch: fetchProfile };
}
