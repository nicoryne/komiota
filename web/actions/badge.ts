'use server';

import { revalidatePath } from 'next/cache';
import { badgeSchema } from '@/lib/schemas/badge';
import { BadgeService } from '@/services/badge';
import { ActionResult } from '@/lib/types/base';
import type { Badge } from '@/services/badge';

const REVALIDATE_PATH = '/dashboard/badges';

export async function createBadge(input: unknown): Promise<ActionResult<Badge>> {
  const parsed = badgeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await BadgeService.create(parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function updateBadge(
  id: string,
  input: unknown
): Promise<ActionResult<Badge>> {
  const parsed = badgeSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await BadgeService.update(id, parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function deleteBadge(id: string): Promise<ActionResult> {
  const result = await BadgeService.delete(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true };
}
