import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { Database } from '@/database.types';
import { BaseService } from './base';

type RouteRow = Database['public']['Tables']['routes']['Row'];
type RouteStopRow = Database['public']['Tables']['route_stops']['Row'];
type BusStopRow = Database['public']['Tables']['bus_stops']['Row'];

export type Route = RouteRow;
export type RouteStop = RouteStopRow;

export type RouteWithStopCount = Route & { stop_count: number };

export type RouteStopWithBusStop = RouteStop & { stop: BusStopRow };

export type RouteWithStops = Route & { stops: RouteStopWithBusStop[] };

export type RouteCreateInput = {
  name: string;
  description?: string | null;
  point_multiplier?: number | null;
};

export class RouteService extends BaseService {
  static async list(
    options: PaginationOptions
  ): Promise<ServiceResponse<PaginatedResponse<RouteWithStopCount>>> {
    return this.getPaginatedData<RouteWithStopCount, 'routes'>(
      'routes',
      {
        ...options,
        searchableFields: options.searchableFields ?? ['name'],
      },
      '*, route_stops(count)'
    );
  }

  static async getById(id: string): Promise<ServiceResponse<RouteWithStops>> {
    try {
      const supabase = await this.getClient();
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single();

      if (routeError) {
        return this.formatError(routeError, 'Route not found');
      }

      if (!route) {
        return { success: false, error: 'Route not found' };
      }

      const { data: stops, error: stopsError } = await supabase
        .from('route_stops')
        .select('*, bus_stops(*)')
        .eq('route_id', id)
        .order('order_index', { ascending: true });

      if (stopsError) {
        return this.formatError(stopsError, 'Failed to fetch route stops');
      }

      const stopsWithBusStop: RouteStopWithBusStop[] = (stops ?? []).map((s) => {
        const { bus_stops, ...routeStop } = s as RouteStop & { bus_stops: BusStopRow };
        return { ...routeStop, stop: bus_stops };
      });

      return {
        success: true,
        data: { ...(route as Route), stops: stopsWithBusStop },
      };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch route');
    }
  }

  static async create(data: RouteCreateInput): Promise<ServiceResponse<Route>> {
    try {
      const supabase = await this.getClient();
      const { data: inserted, error } = await supabase
        .from('routes')
        .insert({
          name: data.name,
          description: data.description ?? null,
          point_multiplier: data.point_multiplier ?? 1.0,
        })
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to create route');
      }

      return { success: true, data: inserted as Route };
    } catch (error) {
      return this.formatError(error, 'Failed to create route');
    }
  }

  static async update(
    id: string,
    data: Partial<RouteCreateInput>
  ): Promise<ServiceResponse<Route>> {
    try {
      const supabase = await this.getClient();
      const updatePayload: Database['public']['Tables']['routes']['Update'] = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.description !== undefined) updatePayload.description = data.description ?? null;
      if (data.point_multiplier !== undefined)
        updatePayload.point_multiplier = data.point_multiplier ?? null;

      const { data: updated, error } = await supabase
        .from('routes')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to update route');
      }

      return { success: true, data: updated as Route };
    } catch (error) {
      return this.formatError(error, 'Failed to update route');
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const supabase = await this.getClient();

      // Cascade: delete route_stops first
      const { error: stopsError } = await supabase
        .from('route_stops')
        .delete()
        .eq('route_id', id);

      if (stopsError) {
        return this.formatError(stopsError, 'Failed to delete route stops');
      }

      const { error } = await supabase.from('routes').delete().eq('id', id);

      if (error) {
        return this.formatError(error, 'Failed to delete route');
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to delete route');
    }
  }

  static async addStop(routeId: string, stopId: string): Promise<ServiceResponse<RouteStop>> {
    try {
      const supabase = await this.getClient();

      // Find max order_index for this route
      const { data: existing, error: fetchError } = await supabase
        .from('route_stops')
        .select('order_index')
        .eq('route_id', routeId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) {
        return this.formatError(fetchError, 'Failed to fetch existing stops');
      }

      const maxIndex = existing && existing.length > 0 ? existing[0].order_index : -1;
      const newOrderIndex = maxIndex + 1;

      const { data: inserted, error } = await supabase
        .from('route_stops')
        .insert({
          route_id: routeId,
          stop_id: stopId,
          order_index: newOrderIndex,
        })
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to add stop to route');
      }

      return { success: true, data: inserted as RouteStop };
    } catch (error) {
      return this.formatError(error, 'Failed to add stop to route');
    }
  }

  static async reorderStops(
    routeId: string,
    orderedRouteStopIds: string[]
  ): Promise<ServiceResponse<void>> {
    try {
      const supabase = await this.getClient();

      // Update each route_stop's order_index atomically (sequential updates)
      for (let i = 0; i < orderedRouteStopIds.length; i++) {
        const { error } = await supabase
          .from('route_stops')
          .update({ order_index: i })
          .eq('id', orderedRouteStopIds[i])
          .eq('route_id', routeId);

        if (error) {
          return this.formatError(error, 'Failed to reorder stops');
        }
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to reorder stops');
    }
  }

  static async removeStop(routeId: string, routeStopId: string): Promise<ServiceResponse<void>> {
    try {
      const supabase = await this.getClient();

      // Delete the specific route_stop
      const { error: deleteError } = await supabase
        .from('route_stops')
        .delete()
        .eq('id', routeStopId)
        .eq('route_id', routeId);

      if (deleteError) {
        return this.formatError(deleteError, 'Failed to remove stop from route');
      }

      // Re-fetch remaining stops ordered by current order_index
      const { data: remaining, error: fetchError } = await supabase
        .from('route_stops')
        .select('id, order_index')
        .eq('route_id', routeId)
        .order('order_index', { ascending: true });

      if (fetchError) {
        return this.formatError(fetchError, 'Failed to fetch remaining stops for re-indexing');
      }

      // Re-index remaining stops to be contiguous starting from 0
      for (let i = 0; i < (remaining ?? []).length; i++) {
        const stop = remaining![i];
        if (stop.order_index !== i) {
          const { error: updateError } = await supabase
            .from('route_stops')
            .update({ order_index: i })
            .eq('id', stop.id);

          if (updateError) {
            return this.formatError(updateError, 'Failed to re-index stops');
          }
        }
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to remove stop from route');
    }
  }

  static async getTotalCount(): Promise<ServiceResponse<number>> {
    try {
      const supabase = await this.getClient();
      const { count, error } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return this.formatError(error, 'Failed to count routes');
      }

      return { success: true, data: count ?? 0 };
    } catch (error) {
      return this.formatError(error, 'Failed to count routes');
    }
  }
}
