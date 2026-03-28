import { ServiceResponse } from '@/lib/types/base';
import { BadgeInput } from '@/lib/schemas/badge';
import { Database } from '@/database.types';
import { BaseService } from './base';

type BadgeRow = Database['public']['Tables']['badges']['Row'];

export type Badge = BadgeRow;
export type BadgeWithAwardCount = Badge & { award_count: number };

export type BadgeCreateInput = BadgeInput;

export class BadgeService extends BaseService {
  static async list(): Promise<ServiceResponse<BadgeWithAwardCount[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('badges')
        .select('*, user_badges(count)')
        .order('name', { ascending: true });

      if (error) {
        return this.formatError(error, 'Failed to fetch badges');
      }

      const badges = (data ?? []).map((row) => {
        const { user_badges, ...badge } = row as Badge & { user_badges: { count: number }[] };
        const award_count =
          Array.isArray(user_badges) && user_badges.length > 0 ? user_badges[0].count : 0;
        return { ...badge, award_count };
      });

      return { success: true, data: badges };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch badges');
    }
  }

  static async getById(id: string): Promise<ServiceResponse<Badge>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return this.formatError(error, 'Badge not found');
      }

      return { success: true, data: data as Badge };
    } catch (error) {
      return this.formatError(error, 'Failed to fetch badge');
    }
  }

  static async create(input: BadgeCreateInput): Promise<ServiceResponse<Badge>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('badges')
        .insert(input)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to create badge');
      }

      return { success: true, data: data as Badge };
    } catch (error) {
      return this.formatError(error, 'Failed to create badge');
    }
  }

  static async update(
    id: string,
    input: Partial<BadgeCreateInput>
  ): Promise<ServiceResponse<Badge>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('badges')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.formatError(error, 'Failed to update badge');
      }

      return { success: true, data: data as Badge };
    } catch (error) {
      return this.formatError(error, 'Failed to update badge');
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const supabase = await this.getClient();

      // Remove all associated user_badges records before deleting the badge (Req 10.4)
      const { error: userBadgesError } = await supabase
        .from('user_badges')
        .delete()
        .eq('badge_id', id);

      if (userBadgesError) {
        return this.formatError(userBadgesError, 'Failed to remove associated user badges');
      }

      const { error } = await supabase.from('badges').delete().eq('id', id);

      if (error) {
        return this.formatError(error, 'Failed to delete badge');
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.formatError(error, 'Failed to delete badge');
    }
  }
}
