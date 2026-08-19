'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) setReady(Boolean(data.session)); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (mounted) setReady(Boolean(session)); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return toast.error('Supabase is not configured.');
    if (password.length < 8) return toast.error('Password must be at least 8 characters.');
    if (password !== confirm) return toast.error('Passwords do not match.');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success('Password updated successfully.');
    router.replace('/');
  };

  return <main className="min-h-screen grid place-items-center bg-background text-foreground p-6"><div className="w-full max-w-md"><div className="flex justify-center mb-8"><AppLogo size={42}/></div><div className="app-surface p-6 sm:p-8"><h1 className="text-2xl font-bold text-center">Set a new password</h1><p className="mt-2 text-sm text-muted-foreground text-center">Choose a new password for your SmartNotepad account.</p>{!ready ? <div className="mt-8 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground text-center">Open this page from the password-reset email to continue.</div> : <form onSubmit={submit} className="mt-7 space-y-4"><label className="block"><span className="block text-sm font-medium mb-1.5">New password</span><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} minLength={8} autoComplete="new-password" required className="auth-input pr-10" placeholder="Minimum 8 characters"/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label><label className="block"><span className="block text-sm font-medium mb-1.5">Confirm password</span><input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" autoComplete="new-password" required className="auth-input" placeholder="Repeat password"/></label><button disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{loading?'Updating…':'Update password'} {!loading&&<ArrowRight size={16}/>}</button></form>}<button onClick={()=>router.replace('/')} className="w-full mt-5 text-sm text-primary hover:underline">Back to sign in</button></div></div></main>;
}
