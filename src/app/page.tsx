'use client';

import { useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import { supabase } from '@/lib/supabase';
import { setActiveStorageUser } from '@/lib/notesStorage';

export default function SignUpLoginPage() {
  useEffect(() => {
    // The root page is the signed-out entry point. This guarantees that
    // Settings -> Sign out cannot leave a live Supabase session behind.
    void supabase.auth.signOut().finally(() => setActiveStorageUser(null));
  }, []);

  return <AuthScreen />;
}
