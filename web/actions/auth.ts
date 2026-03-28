'use server';

import { redirect } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { ActionResult } from '@/lib/types/base';

export async function logoutAction(): Promise<ActionResult> {
  const result = await AuthService.logout();

  if (result.success) {
    redirect('/login');
  }

  return result;
}
