import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/types';

// ─── Factions ────────────────────────────────────────────────────

export async function getFactions(): Promise<Tables<'factions'>[]> {
  const { data, error } = await supabase
    .from('factions')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getFactionLeaderboard(): Promise<Tables<'factions'>[]> {
  const { data, error } = await supabase
    .from('factions')
    .select('*')
    .order('total_score', { ascending: false });

  if (error) throw error;
  return data;
}

// ─── Badges ──────────────────────────────────────────────────────

export async function getBadges(): Promise<Tables<'badges'>[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      awarded_at,
      badges (*)
    `)
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) throw error;
  return data;
}
