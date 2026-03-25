import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'routes',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'point_multiplier', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'bus_stops',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'created_by', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'route_stops',
      columns: [
        { name: 'route_id', type: 'string' },
        { name: 'stop_id', type: 'string' },
        { name: 'order_index', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'user_bookmarks',
      columns: [
        { name: 'profile_id', type: 'string' },
        { name: 'target_type', type: 'string' },
        { name: 'target_id', type: 'string' },
      ],
    }),
  ],
});
