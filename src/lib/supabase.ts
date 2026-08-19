'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// SmartNotepad production Supabase project.
// These are public browser credentials only. Never put a service-role key here.
const PRODUCTION_SUPABASE_URL = 'https://pjeagsxttqdftvetpxcc.supabase.co';
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xwTFjx_1yTXvWmeRNDzfEQ_z-c_HC4J';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || PRODUCTION_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  PRODUCTION_SUPABASE_PUBLISHABLE_KEY;

// The production URL/key are intentionally available as browser-safe fallbacks.
// This prevents a missing Vercel env var from disabling authentication.
export const supabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
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
