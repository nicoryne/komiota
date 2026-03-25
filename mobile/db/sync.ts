import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { supabase } from '../lib/supabase';

/**
 * Synchronizes the local WatermelonDB with Supabase.
 * Only syncs static/offline data: routes, bus_stops, route_stops, user_bookmarks.
 * Live tracking and gamification data are online-only (see services/).
 */
export async function syncDatabase() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const since = lastPulledAt
        ? new Date(lastPulledAt).toISOString()
        : new Date(0).toISOString();

      // Fetch changes from Supabase for each synced table
      const [routesRes, busStopsRes, routeStopsRes, bookmarksRes] =
        await Promise.all([
          supabase
            .from('routes')
            .select('*')
            .gte('updated_at', since),
          supabase
            .from('bus_stops')
            .select('*')
            .gte('updated_at', since),
          supabase
            .from('route_stops')
            .select('*'),
          supabase
            .from('user_bookmarks')
            .select('*'),
        ]);

      // Convert PostGIS location → lat/lng for bus stops
      const busStops = (busStopsRes.data ?? []).map((stop: any) => {
        const { location, ...rest } = stop;
        let latitude = 0;
        let longitude = 0;

        // PostGIS returns location as GeoJSON or WKT depending on config
        if (location && typeof location === 'object' && 'coordinates' in location) {
          // GeoJSON format: [lng, lat]
          longitude = location.coordinates[0];
          latitude = location.coordinates[1];
        }

        return { ...rest, latitude, longitude };
      });

      const timestamp = Date.now();

      return {
        changes: {
          routes: {
            created: routesRes.data ?? [],
            updated: [],
            deleted: [],
          },
          bus_stops: {
            created: busStops,
            updated: [],
            deleted: [],
          },
          route_stops: {
            created: routeStopsRes.data ?? [],
            updated: [],
            deleted: [],
          },
          user_bookmarks: {
            created: bookmarksRes.data ?? [],
            updated: [],
            deleted: [],
          },
        },
        timestamp,
      };
    },

    pushChanges: async ({ changes }) => {
      // Push locally created/updated bus stops back to Supabase
      // Convert lat/lng → PostGIS Point
      const busStopChanges = (changes as any).bus_stops;
      const bookmarkChanges = (changes as any).user_bookmarks;

      if (busStopChanges?.created?.length) {
        for (const stop of busStopChanges.created) {
          const { latitude, longitude, ...rest } = stop;
          await supabase.from('bus_stops').insert({
            ...rest,
            location: `SRID=4326;POINT(${longitude} ${latitude})`,
          });
        }
      }

      if (busStopChanges?.updated?.length) {
        for (const stop of busStopChanges.updated) {
          const { latitude, longitude, id, ...rest } = stop;
          await supabase
            .from('bus_stops')
            .update({
              ...rest,
              location: `SRID=4326;POINT(${longitude} ${latitude})`,
            })
            .eq('id', id);
        }
      }

      // Push bookmark changes
      if (bookmarkChanges?.created?.length) {
        await supabase.from('user_bookmarks').insert(bookmarkChanges.created);
      }

      if (bookmarkChanges?.deleted?.length) {
        for (const id of bookmarkChanges.deleted) {
          await supabase.from('user_bookmarks').delete().eq('id', id);
        }
      }
    },
  });
}
