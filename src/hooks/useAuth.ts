import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  loading: boolean;  // true while checking session on startup
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseEnabled); // only loading if Supabase is on

  useEffect(() => {
    if (!isSupabaseEnabled) return;

    // Get current session immediately
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to all future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isSupabaseEnabled) await supabase!.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}
