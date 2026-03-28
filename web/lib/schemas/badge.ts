import { z } from 'zod';

export const badgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  icon_url: z.string().url().optional().nullable(),
  criteria: z.string().optional().nullable(),
});

export type BadgeInput = z.infer<typeof badgeSchema>;
