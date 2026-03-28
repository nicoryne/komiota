import { ServiceResponse } from '@/lib/types/base';
import { Database } from '@/database.types';
import { BaseService } from './base';

type FactionRow = Database['public']['Tables']['factions']['Row'];

export type Faction = FactionRow;
export type FactionWithMemberCount = Faction & { member_count: number };

export type FactionCreateInput = {
  name: string;
  description?: string | null;
};

export class FactionService extends BaseService {
  static async list(): Promise<ServiceResponse<FactionWithMemberCount[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('factions')
        .select('*, profiles(count)')
        .order('name', { ascending: true });

      if (error) {
        return this.formatError(error, 'Failed to fetch factions');
      }

      const factions = (data ?? []).map((row) => {
        const { profiles, ...faction } = row as Faction & { profiles: { count: number }[] };
        const member_count =
          Array.isArray(profiles) && profiles.length > 0 ? profiles[0].count : 0;
        return { ...faction, member_count };
      });

      return { success: true, data: factions };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch factions');
    }
  }

  static async getById(id: string): Promise<ServiceResponse<Faction>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('factions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.formatError(error, 'Faction not found');
      }

      return { success: true, data: data as Faction };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch faction');
    }
  }

  static async create(input: FactionCreateInput): Promise<ServiceResponse<Faction>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('factions')
        .insert(input)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to create faction');
      }

      return { success: true, data: data as Faction };
    } catch (error) {
      return this.formatError(error, 'Failed to create faction');
    }
  }

  static async update(
    id: string,
    input: Partial<FactionCreateInput>
  ): Promise<ServiceResponse<Faction>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('factions')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to update faction');
      }

      return { success: true, data: data as Faction };
    } catch (error) {
      return this.formatError(error, 'Failed to update faction');
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const supabase = await this.getClient();

      // Nullify faction_id on all member profiles before deleting (Req 9.4)
      const { error: nullifyError } = await supabase
        .from('profiles')
        .update({ faction_id: null })
        .eq('faction_id', id);

      if (nullifyError) {
        return this.formatError(nullifyError, 'Failed to nullify member faction_id');
      }

      const { error } = await supabase.from('factions').delete().eq('id', id);

      if (error) {
        return this.formatError(error, 'Failed to delete faction');
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to delete faction');
    }
  }
}
