import { supabase } from '../lib/supabase';
import type { Tables, Enums } from '../lib/types';

type BookmarkTarget = Enums<'app_role'> extends never
  ? 'route' | 'stop'
  : 'route' | 'stop';

export async function getBookmarks(
  userId: string,
): Promise<Tables<'user_bookmarks'>[]> {
  const { data, error } = await supabase
    .from('user_bookmarks')
    .select('*')
    .eq('profile_id', userId);

  if (error) throw error;
  return data;
}

export async function addBookmark(
  userId: string,
  targetType: 'route' | 'stop',
  targetId: string,
): Promise<Tables<'user_bookmarks'>> {
  const { data, error } = await supabase
    .from('user_bookmarks')
    .insert({
      profile_id: userId,
      target_type: targetType,
      target_id: targetId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBookmark(bookmarkId: string): Promise<void> {
  const { error } = await supabase
    .from('user_bookmarks')
    .delete()
    .eq('id', bookmarkId);

  if (error) throw error;
}
