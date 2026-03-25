import { supabase } from '../lib/supabase';
import { authSchema } from '../lib/schemas';

export async function signUpWithEmail(
  email: string,
  password: string,
  options?: { username?: string; faction_id?: string },
) {
  const validated = authSchema.parse({ email, password });

  const { data: authData, error: authError } =
    await supabase.auth.signUp({ email: validated.email, password: validated.password });

  if (authError) throw authError;

  // Create a profile row for the new user
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: options?.username ?? null,
        faction_id: options?.faction_id ?? null,
        onboarding_completed: true,
      });

    if (profileError) throw profileError;
  }

  return authData;
}

export async function signInWithEmail(email: string, password: string) {
  const validated = authSchema.parse({ email, password });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback);
}
