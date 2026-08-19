'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { setActiveStorageUser } from '@/lib/notesStorage';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        setActiveStorageUser(null);
        router.replace('/');
      } else {
        setActiveStorageUser(data.session.user.id);
        setReady(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setActiveStorageUser(null);
        router.replace('/');
      } else {
        setActiveStorageUser(session.user.id);
        setReady(true);
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [router]);

  if (!ready) return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">Loading your workspace…</div>;
  return <>{children}</>;
}
