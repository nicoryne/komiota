'use server';

import { revalidatePath } from 'next/cache';
import { accountRoleSchema } from '@/lib/schemas/account';
import { AccountService } from '@/services/account';
import { AuthService } from '@/services/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/base';
import type { Profile } from '@/services/account';

export async function updateAccountRole(
  targetUserId: string,
  input: unknown
): Promise<ActionResult<Profile>> {
  const parsed = accountRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const auth = await AuthService.checkAuth(['admin']);
  if (!auth.authenticated || !auth.authorized) {
    return { success: false, error: auth.error ?? 'Unauthorized' };
  }

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const requestingUserId = user?.id ?? '';

  const result = await AccountService.updateRole(targetUserId, parsed.data.role, requestingUserId);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath('/dashboard/accounts');
  return { success: true, data: result.data };
}
