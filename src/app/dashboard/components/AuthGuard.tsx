'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) { router.replace('/'); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) router.replace('/'); else setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/');
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [router]);

  if (!ready) return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">Loading your workspace…</div>;
  return <>{children}</>;
}
