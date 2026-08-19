'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjeagsxttqdftvetpxcc.supabase.co';
// Supabase publishable keys are intended for browser-side use. Keep the env override,
// but provide the project's publishable key as a fallback so the deployed app still
// connects if Vercel production variables were not copied over.
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xwTFjx_1yTXvWmeRNDzfEQ_z-c_HC4J';

export const supabaseConfigured = Boolean(url && key);
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, key, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } })
  : null;

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

export async function ensureSupabaseUser() {
  return getCurrentUser();
}
