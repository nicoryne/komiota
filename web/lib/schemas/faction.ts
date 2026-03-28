import { z } from 'zod';

export const factionSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional().nullable(),
});

export type FactionInput = z.infer<typeof factionSchema>;
