import { z } from 'zod';

export const routeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  point_multiplier: z.number().min(0.1).max(10.0).default(1.0),
});

export type RouteInput = z.infer<typeof routeSchema>;
