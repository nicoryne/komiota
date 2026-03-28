import { z } from 'zod';

export const accountRoleSchema = z.object({
  role: z.enum(['admin', 'moderator', 'user']),
});

export type AccountRoleInput = z.infer<typeof accountRoleSchema>;
