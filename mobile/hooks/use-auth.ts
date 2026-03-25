import { useState, useEffect, useCallback } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as authService from '../services/auth';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Get initial session
    authService.getCurrentSession().then((session) => {
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setState({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return authService.signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    options?: { username?: string; faction_id?: string },
  ) => {
    return authService.signUpWithEmail(email, password, options);
  }, []);

  const signOut = useCallback(async () => {
    return authService.signOut();
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.session,
    signIn,
    signUp,
    signOut,
  };
}
