'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase's browser key is intentionally public. Prefer Vercel/local env vars,
// but keep a public fallback so a missing Vercel env var cannot disable the app.
const SUPABASE_URL = 'https://pjeagsxttqdftvetpxcc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xwTFjx_1yTXvWmeRNDzfEQ_z-c_HC4J';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getAuthSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (configured) {
    const normalized = configured.startsWith('http') ? configured : `https://${configured}`;
    return normalized.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function ensureSupabaseUser() {
  return getCurrentUser();
}
