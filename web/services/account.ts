import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { Database } from '@/database.types';
import { BaseService } from './base';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FactionRow = Database['public']['Tables']['factions']['Row'];

export type Profile = ProfileRow;

export type ProfileWithDetails = Profile & {
  faction: Pick<FactionRow, 'id' | 'name' | 'total_score'> | null;
  badge_count: number;
};

export type AccountRole = Database['public']['Enums']['app_role'];

export class AccountService extends BaseService {
  static async list(
    options: PaginationOptions
  ): Promise<ServiceResponse<PaginatedResponse<Profile>>> {
    return this.getPaginatedData<Profile, 'profiles'>(
      'profiles',
      {
        ...options,
        searchableFields: options.searchableFields ?? ['username'],
      },
      '*'
    );
  }

  static async getById(id: string): Promise<ServiceResponse<ProfileWithDetails>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*, factions(id, name, total_score), user_badges(count)')
        .eq('id', id)
        .single();

      if (error) {
        return this.formatError(error, 'Account not found');
      }

      if (!data) {
        return { success: false, error: 'Account not found' };
      }

      const { factions, user_badges, ...profile } = data as Profile & {
        factions: Pick<FactionRow, 'id' | 'name' | 'total_score'> | null;
        user_badges: { count: number }[];
      };

      const badge_count =
        Array.isArray(user_badges) && user_badges.length > 0
          ? (user_badges[0] as { count: number }).count
          : 0;

      return {
        success: true,
        data: {
          ...profile,
          faction: factions ?? null,
          badge_count,
        },
      };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch account');
    }
  }

  static async updateRole(
    targetUserId: string,
    newRole: AccountRole,
    requestingUserId: string
  ): Promise<ServiceResponse<Profile>> {
    try {
      // Prevent self-demotion: if the requesting user is the target and the new role is not 'admin'
      if (targetUserId === requestingUserId && newRole !== 'admin') {
        return { success: false, error: 'You cannot demote yourself from admin.' };
      }

      const adminClient = await this.getAdminClient();
      const { data, error } = await adminClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to update role');
      }

      return { success: true, data: data as Profile };
    } catch (error) {
      return this.formatError(error, 'Failed to update role');
    }
  }

  static async getTotalCount(): Promise<ServiceResponse<number>> {
    try {
      const supabase = await this.getClient();
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return this.formatError(error, 'Failed to count users');
      }

      return { success: true, data: count ?? 0 };
    } catch (error) {
      return this.formatError(error, 'Failed to count users');
    }
  }
}
