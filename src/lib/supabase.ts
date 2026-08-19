'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Publishable keys are intended for browser use. RLS remains the security boundary.
const DEFAULT_URL = 'https://pjeagsxttqdftvetpxcc.supabase.co';
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_xwTFjx_1yTXvWmeRNDzfEQ_z-c_HC4J';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, key, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } })
  : null;

export async function ensureSupabaseUser() {
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) return sessionData.session.user;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('SmartNotepad cloud auth unavailable:', error.message);
    return null;
  }
  return data.user ?? null;
}
