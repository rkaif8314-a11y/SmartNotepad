'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// SmartNotepad production Supabase project.
// The browser key is intentionally safe to expose in client-side code.
// Keep the production values as the final fallback so a missing or stale
// Vercel environment variable can never make authentication appear disabled.
const PRODUCTION_SUPABASE_URL = 'https://pjeagsxttqdftvetpxcc.supabase.co';
const PRODUCTION_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZWFnc3h0dHFkZnR2ZXRweGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwOTIwMzksImV4cCI6MjEwMjY2ODAzOX0.Tf4HtNhtrtzTRMj_gwE7tGfgbc_2hP7W9ocuIdGNE4k';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || PRODUCTION_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  PRODUCTION_SUPABASE_ANON_KEY;

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
