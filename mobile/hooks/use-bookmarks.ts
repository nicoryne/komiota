import { useState, useEffect, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../db';
import UserBookmark from '../db/models/user-bookmarks';

/**
 * Observes user bookmarks from local WatermelonDB with add/remove mutations.
 */
export function useBookmarks(profileId: string | undefined) {
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);

  useEffect(() => {
    if (!profileId) return;

    const subscription = database
      .get<UserBookmark>('user_bookmarks')
      .query(Q.where('profile_id', profileId))
      .observe()
      .subscribe((data) => setBookmarks(data));

    return () => subscription.unsubscribe();
  }, [profileId]);

  const addBookmark = useCallback(
    async (targetType: 'route' | 'stop', targetId: string) => {
      if (!profileId) return;
      await database.write(async () => {
        await database.get<UserBookmark>('user_bookmarks').create((record) => {
          record.profileId = profileId;
          record.targetType = targetType;
          record.targetId = targetId;
        });
      });
    },
    [profileId],
  );

  const removeBookmark = useCallback(async (bookmark: UserBookmark) => {
    await database.write(async () => {
      await bookmark.markAsDeleted();
    });
  }, []);

  return { bookmarks, addBookmark, removeBookmark };
}
