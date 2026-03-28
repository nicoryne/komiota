'use server';

import { revalidatePath } from 'next/cache';
import { routeSchema } from '@/lib/schemas/route';
import { RouteService } from '@/services/route';
import { ActionResult } from '@/lib/types/base';
import type { Route, RouteStop } from '@/services/route';

const REVALIDATE_PATH = '/dashboard/routes';

export async function createRoute(input: unknown): Promise<ActionResult<Route>> {
  const parsed = routeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await RouteService.create(parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function updateRoute(
  id: string,
  input: unknown
): Promise<ActionResult<Route>> {
  const parsed = routeSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await RouteService.update(id, parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function deleteRoute(id: string): Promise<ActionResult> {
  const result = await RouteService.delete(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true };
}

export async function addRouteStop(
  routeId: string,
  stopId: string
): Promise<ActionResult<RouteStop>> {
  const result = await RouteService.addStop(routeId, stopId);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function reorderRouteStops(
  routeId: string,
  orderedRouteStopIds: string[]
): Promise<ActionResult> {
  const result = await RouteService.reorderStops(routeId, orderedRouteStopIds);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true };
}

export async function removeRouteStop(
  routeId: string,
  routeStopId: string
): Promise<ActionResult> {
  const result = await RouteService.removeStop(routeId, routeStopId);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true };
}
