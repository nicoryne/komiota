'use server';

import { revalidatePath } from 'next/cache';
import { factionSchema } from '@/lib/schemas/faction';
import { FactionService } from '@/services/faction';
import { ActionResult } from '@/lib/types/base';
import type { Faction } from '@/services/faction';

const REVALIDATE_PATH = '/dashboard/factions';

export async function createFaction(input: unknown): Promise<ActionResult<Faction>> {
  const parsed = factionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await FactionService.create(parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function updateFaction(
  id: string,
  input: unknown
): Promise<ActionResult<Faction>> {
  const parsed = factionSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await FactionService.update(id, parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function deleteFaction(id: string): Promise<ActionResult> {
  const result = await FactionService.delete(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true };
}
