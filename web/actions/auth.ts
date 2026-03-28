'use server';

import { redirect } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { ActionResult } from '@/lib/types/base';
import { LoginResult } from '@/lib/types/auth';

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  return AuthService.login(email, password);
}

export async function logoutAction(): Promise<ActionResult> {
  const result = await AuthService.logout();

  if (result.success) {
    redirect('/login');
  }

  return result;
}
