'use server';

import { revalidatePath } from 'next/cache';
import { busStopSchema } from '@/lib/schemas/bus-stop';
import { BusStopService } from '@/services/bus-stop';
import { ActionResult } from '@/lib/types/base';
import type { BusStop } from '@/services/bus-stop';

const REVALIDATE_PATH = '/dashboard/bus-stops';

export async function createBusStop(
  input: unknown
): Promise<ActionResult<BusStop>> {
  const parsed = busStopSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await BusStopService.create(parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function updateBusStopStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<ActionResult<BusStop>> {
  if (status !== 'approved' && status !== 'rejected') {
    return { success: false, error: 'Invalid status value' };
  }

  const result = await BusStopService.updateStatus(id, status);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function updateBusStop(
  id: string,
  input: unknown
): Promise<ActionResult<BusStop>> {
  const parsed = busStopSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await BusStopService.update(id, parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function deleteBusStop(id: string): Promise<ActionResult> {
  const result = await BusStopService.delete(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true };
}
