'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveStorageUser } from '@/lib/notesStorage';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState('Confirming your account…');

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      if (!supabase) {
        router.replace('/');
        return;
      }

      try {
        const code = params.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.user) setActiveStorageUser(data.user.id);
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data.session?.user) setActiveStorageUser(data.session.user.id);
        }

        if (!cancelled) {
          const next = params.get('next') || '/dashboard';
          router.replace(next.startsWith('/') ? next : '/dashboard');
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'Email confirmation could not be completed.');
          setTimeout(() => router.replace('/'), 2500);
        }
      }
    };

    void finish();
    return () => { cancelled = true; };
  }, [params, router]);

  return (
    <main className="min-h-screen grid place-items-center bg-[#f7f8fc] px-6 text-[#11152a]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        <h1 className="text-xl font-bold">SmartNotepad</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </main>
  );
}
