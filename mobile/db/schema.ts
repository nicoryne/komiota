import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'bus_stops',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'status', type: 'string' }, // e.g., 'verified', 'pending'
        { name: 'image_url', type: 'string', isOptional: true },
        // PostGIS will handle the complex spatial indexing on the backend, 
        // but local queries will rely on basic lat/lon bounding box filtering 
        // or just caching the relevant region.
      ],
    }),
    tableSchema({
      name: 'routes',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
      ],
    }),
  ],
});
