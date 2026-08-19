'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'forgot';
interface FormData { name?: string; email: string; password?: string; confirmPassword?: string; }

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>();

  const submit = async (data: FormData) => {
    if (!supabase) { toast.error('Supabase is not configured.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password || '' });
        if (error) throw error;
        toast.success('Welcome back!'); router.replace('/dashboard'); return;
      }
      if (mode === 'signup') {
        if (data.password !== data.confirmPassword) { form.setError('confirmPassword', { message: 'Passwords do not match' }); return; }
        const { data: result, error } = await supabase.auth.signUp({ email: data.email, password: data.password || '', options: { data: { full_name: data.name || '' } } });
        if (error) throw error;
        if (result.session) { toast.success('Account created!'); router.replace('/dashboard'); }
        else { toast.success('Account created. Check your email to confirm your address.'); setMode('login'); }
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      toast.success('Password reset email sent.'); setMode('login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally { setLoading(false); }
  };

  return <main className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
    <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-card border-r border-border"><div className="flex items-center gap-3"><AppLogo size={38}/><span className="text-xl font-bold">Smart<span className="text-primary">Notepad</span></span></div><div className="max-w-lg"><p className="text-sm font-semibold text-primary mb-3">Your private workspace</p><h1 className="text-5xl font-bold tracking-tight leading-tight">Write. Organize.<br/>Remember everything.</h1><p className="mt-5 text-base leading-7 text-muted-foreground">Your notes are connected to your account and protected by Supabase authentication and row-level security.</p></div><p className="text-xs text-muted-foreground">SmartNotepad • Secure cloud notes</p></section>
    <section className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-md"><div className="lg:hidden flex items-center gap-2 mb-10"><AppLogo size={34}/><span className="font-bold text-lg">Smart<span className="text-primary">Notepad</span></span></div><h2 className="text-2xl font-bold tracking-tight">{mode==='login'?'Welcome back':mode==='signup'?'Create your account':'Reset your password'}</h2><p className="mt-1 text-sm text-muted-foreground">{mode==='login'?'Sign in to your cloud workspace.':mode==='signup'?'Your notes will sync securely across sessions.':'We will send a secure reset link to your email.'}</p>
      <form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-4">
        {mode==='signup'&&<Field icon={User} label="Full name" error={form.formState.errors.name?.message}><input {...form.register('name',{required:'Name is required'})} autoComplete="name" placeholder="Your name" className="auth-input"/></Field>}
        <Field icon={Mail} label="Email" error={form.formState.errors.email?.message}><input {...form.register('email',{required:'Email is required',pattern:{value:/^\S+@\S+\.\S+$/,message:'Enter a valid email'}})} type="email" autoComplete="email" placeholder="you@example.com" className="auth-input"/></Field>
        {mode!=='forgot'&&<Field icon={Lock} label="Password" error={form.formState.errors.password?.message}><div className="relative"><input {...form.register('password',{required:'Password is required',minLength:{value:8,message:'Minimum 8 characters'}})} type={showPassword?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} placeholder="••••••••" className="auth-input pr-10"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></Field>}
        {mode==='signup'&&<Field icon={Lock} label="Confirm password" error={form.formState.errors.confirmPassword?.message}><input {...form.register('confirmPassword',{required:'Confirm your password'})} type="password" autoComplete="new-password" placeholder="Repeat password" className="auth-input"/></Field>}
        <button disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{loading?'Please wait…':mode==='login'?'Sign in':mode==='signup'?'Create account':'Send reset link'} {!loading&&<ArrowRight size={16}/>}</button>
      </form>
      {mode==='login'&&<button type="button" onClick={()=>setMode('forgot')} className="w-full mt-3 text-sm text-primary hover:underline">Forgot password?</button>}
      <div className="mt-6 text-center text-sm text-muted-foreground">{mode==='login'?<>New here? <button onClick={()=>setMode('signup')} className="text-primary font-semibold">Create an account</button></>:<>Already have an account? <button onClick={()=>setMode('login')} className="text-primary font-semibold">Sign in</button></>}</div>
      {mode==='login'&&<div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3"><Sparkles size={17} className="text-primary shrink-0 mt-0.5"/><div className="text-xs text-muted-foreground leading-5"><p className="font-semibold text-foreground mb-0.5">Demo / preview</p><p>This production build uses real Supabase authentication. No fake credentials are shown, so demo access cannot bypass your secure cloud account.</p></div></div>}
    </div></section>
  </main>;
}

function Field({icon:Icon,label,error,children}:{icon:React.ElementType;label:string;error?:string;children:React.ReactNode}) { return <div><label className="block text-sm font-medium mb-1.5">{label}</label><div className="relative"><Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"/>{children}</div>{error&&<p className="text-xs text-red-500 mt-1">{error}</p>}</div>; }
