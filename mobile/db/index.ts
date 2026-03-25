import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { Route, BusStop, RouteStop, UserBookmark } from './models';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true, // Use JSI for faster native bridge (React Native only)
  onSetUpError: (error) => {
    console.error('[WatermelonDB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Route, BusStop, RouteStop, UserBookmark],
});
