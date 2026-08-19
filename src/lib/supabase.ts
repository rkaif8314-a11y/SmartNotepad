'use client';

import { createClient } from '@supabase/supabase-js';

// SmartNotepad production Supabase project.
// These are browser-safe publishable/anon credentials. Never put a service-role key here.
const SUPABASE_URL = 'https://pjeagsxttqdftvetpxcc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xwTFjx_1yTXvWmeRNDzfEQ_z-c_HC4J';

// Environment variables may override these values, but production always has a
// known-good fallback so a missing Vercel env var cannot make authentication null.
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL).trim();
const key = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  SUPABASE_PUBLISHABLE_KEY
).trim();

export const supabaseConfigured = true;

// Always create the client. The previous nullable-client implementation could
// show “Supabase is not configured” in a production build when Vercel env vars
// were missing, even though the Supabase project itself was healthy.
export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function ensureSupabaseUser() {
  return getCurrentUser();
}
