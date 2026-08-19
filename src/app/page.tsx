'use client';

import { useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import { supabase } from '@/lib/supabase';
import { setActiveStorageUser } from '@/lib/notesStorage';

export default function SignUpLoginPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.signOut().finally(() => {
      setActiveStorageUser(null);
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  if (!ready) return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">Signing you out…</div>;
  return <AuthScreen />;
}
