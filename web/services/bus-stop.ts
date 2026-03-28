import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { BusStopInput } from '@/lib/schemas/bus-stop';
import { Database } from '@/database.types';
import { BaseService } from './base';

type BusStopRow = Database['public']['Tables']['bus_stops']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type BusStop = BusStopRow;

export type BusStopWithCreator = BusStop & {
  creator: Pick<ProfileRow, 'id' | 'username' | 'avatar_url' | 'role'> | null;
};

export type BusStopCreateInput = BusStopInput;

export type BusStopStatusCounts = {
  pending: number;
  approved: number;
  rejected: number;
};

export class BusStopService extends BaseService {
  static async list(
    options: PaginationOptions<{ status?: string }>
  ): Promise<ServiceResponse<PaginatedResponse<BusStop>>> {
    return this.getPaginatedData<BusStop, 'bus_stops', { status?: string }>(
      'bus_stops',
      {
        ...options,
        searchableFields: options.searchableFields ?? ['name'],
      },
      '*'
    );
  }

  static async getById(id: string): Promise<ServiceResponse<BusStopWithCreator>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('bus_stops')
        .select('*, profiles!bus_stops_created_by_fkey(id, username, avatar_url, role)')
        .eq('id', id)
        .single();

      if (error) {
        return this.formatError(error, 'Bus stop not found');
      }

      if (!data) {
        return { success: false, error: 'Bus stop not found' };
      }

      const { profiles, ...stop } = data as BusStop & {
        profiles: Pick<ProfileRow, 'id' | 'username' | 'avatar_url' | 'role'> | null;
      };

      return {
        success: true,
        data: { ...stop, creator: profiles ?? null },
      };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch bus stop');
    }
  }

  static async create(data: BusStopCreateInput): Promise<ServiceResponse<BusStop>> {
    try {
      const supabase = await this.getClient();
      const { name, lat, lng, image_url } = data;
      const location = `POINT(${lng} ${lat})`;

      const { data: inserted, error } = await supabase
        .from('bus_stops')
        .insert({ name, location, image_url: image_url ?? null })
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to create bus stop');
      }

      return { success: true, data: inserted as BusStop };
    } catch (error) {
      return this.formatError(error, 'Failed to create bus stop');
    }
  }

  static async updateStatus(
    id: string,
    status: 'approved' | 'rejected'
  ): Promise<ServiceResponse<BusStop>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('bus_stops')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to update bus stop status');
      }

      return { success: true, data: data as BusStop };
    } catch (error) {
      return this.formatError(error, 'Failed to update bus stop status');
    }
  }

  static async update(
    id: string,
    data: Partial<BusStopCreateInput>
  ): Promise<ServiceResponse<BusStop>> {
    try {
      const supabase = await this.getClient();
      const updatePayload: Database['public']['Tables']['bus_stops']['Update'] = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.image_url !== undefined) updatePayload.image_url = data.image_url ?? null;
      if (data.lat !== undefined && data.lng !== undefined) {
        updatePayload.location = `POINT(${data.lng} ${data.lat})`;
      }

      const { data: updated, error } = await supabase
        .from('bus_stops')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to update bus stop');
      }

      return { success: true, data: updated as BusStop };
    } catch (error) {
      return this.formatError(error, 'Failed to update bus stop');
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const supabase = await this.getClient();
      const { error } = await supabase.from('bus_stops').delete().eq('id', id);

      if (error) {
        return this.formatError(error, 'Failed to delete bus stop');
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to delete bus stop');
    }
  }

  static async getStatusCounts(): Promise<ServiceResponse<BusStopStatusCounts>> {
    try {
      const supabase = await this.getClient();

      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        supabase
          .from('bus_stops')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('bus_stops')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved'),
        supabase
          .from('bus_stops')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected'),
      ]);

      if (pendingRes.error) return this.formatError(pendingRes.error, 'Failed to count pending stops');
      if (approvedRes.error) return this.formatError(approvedRes.error, 'Failed to count approved stops');
      if (rejectedRes.error) return this.formatError(rejectedRes.error, 'Failed to count rejected stops');

      return {
        success: true,
        data: {
          pending: pendingRes.count ?? 0,
          approved: approvedRes.count ?? 0,
          rejected: rejectedRes.count ?? 0,
        },
      };
    } catch (error) {
      return this.formatError(error, 'Failed to get status counts');
    }
  }

  static async getApprovedCount(): Promise<ServiceResponse<number>> {
    try {
      const supabase = await this.getClient();
      const { count, error } = await supabase
        .from('bus_stops')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (error) {
        return this.formatError(error, 'Failed to count approved stops');
      }

      return { success: true, data: count ?? 0 };
    } catch (error) {
      return this.formatError(error, 'Failed to count approved stops');
    }
  }
}
