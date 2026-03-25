import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/types';
import { profileUpdateSchema } from '../lib/schemas';

export async function getProfile(userId: string): Promise<Tables<'profiles'>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates only user-editable profile fields.
 * Validates input via Zod before sending to Supabase.
 * Protected columns (role, commuter_score, etc.) are enforced
 * server-side via the `protect_profile_columns` trigger.
 */
export async function updateProfile(
  userId: string,
  updates: Record<string, unknown>,
): Promise<Tables<'profiles'>> {
  const validated = profileUpdateSchema.parse(updates);

  const { data, error } = await supabase
    .from('profiles')
    .update(validated)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeaderboard(limit = 25): Promise<Tables<'profiles'>[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('commuter_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
