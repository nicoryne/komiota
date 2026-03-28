import { z } from 'zod';

export const busStopSchema = z.object({
  name: z.string().min(2).max(100),
  lat: z.number().min(9.8).max(10.6),
  lng: z.number().min(123.6).max(124.1),
  image_url: z.string().url().optional().nullable(),
});

export type BusStopInput = z.infer<typeof busStopSchema>;
