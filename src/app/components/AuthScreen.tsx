'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, Cloud, Zap } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'forgot';
interface FormData { name?: string; email: string; password?: string; confirmPassword?: string; }

const DEMO_EMAIL = 'demo@smartnotepad.app';
const DEMO_PASSWORD = 'demo12345';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', minWidth: '100%', maxWidth: '100%', height: 52, minHeight: 52,
  flex: '1 1 100%', alignSelf: 'stretch', boxSizing: 'border-box',
  padding: '0 48px 0 46px', border: '1px solid #dfe3ee', borderRadius: 14,
  background: '#ffffff', color: '#11152a', lineHeight: '20px', outline: 'none',
};

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>();

  const fillDemo = () => {
    form.setValue('email', DEMO_EMAIL, { shouldValidate: true });
    form.setValue('password', DEMO_PASSWORD, { shouldValidate: true });
    toast.success('Demo credentials filled. Tap "Sign in" to continue.');
  };

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

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#11152a] lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#08091b] px-10 py-9 text-white lg:flex lg:flex-col xl:px-14 xl:py-11">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(111,76,255,.22),transparent_34%),radial-gradient(circle_at_75%_85%,rgba(84,42,255,.28),transparent_38%)]" />
        <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full border border-violet-500/20 shadow-[0_0_120px_rgba(102,62,255,.25)]" />
        <div className="absolute -bottom-24 -right-16 h-[380px] w-[380px] rounded-full border border-violet-400/15" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3"><AppLogo size={42}/><span className="text-[22px] font-bold tracking-tight">Smart<span className="text-violet-400">Notepad</span></span></div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">● Secure &amp; private</div>
        </div>
        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-200"><Sparkles size={14}/> Your private workspace</div>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.045em] xl:text-6xl">Write. Organize.<br/>Remember <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">everything.</span></h1>
          <p className="mt-6 max-w-lg text-[17px] leading-8 text-slate-300">A focused cloud notepad for ideas, plans and everything worth remembering — synced to your account and protected by Supabase.</p>
          <div className="mt-9 grid max-w-lg gap-4">
            <Feature icon={ShieldCheck} title="Private by design" text="Your notes stay connected to your authenticated account." />
            <Feature icon={Cloud} title="Cloud sync" text="Keep your workspace available whenever you sign in." />
            <Feature icon={Zap} title="Fast & focused" text="A clean editor designed to keep you in the flow." />
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500"><span>SmartNotepad • Secure cloud notes</span><span>Built for your ideas</span></div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[500px]">
          <div className="mb-9 flex items-center justify-between lg:hidden"><div className="flex items-center gap-2"><AppLogo size={36}/><span className="text-xl font-bold">Smart<span className="text-primary">Notepad</span></span></div></div>
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 lg:mx-0"><Lock size={24}/></div>
            <h2 className="text-3xl font-bold tracking-[-0.035em]">{mode==='login'?'Welcome back':mode==='signup'?'Create your account':'Reset your password'}</h2>
            <p className="mt-2 text-[15px] text-slate-500">{mode==='login'?'Sign in to your cloud workspace.':mode==='signup'?'Create a secure workspace for your notes.':'We will send a secure reset link to your email.'}</p>
          </div>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-5 w-full">
            {mode==='signup'&&<Field icon={User} label="Full name" error={form.formState.errors.name?.message}><input {...form.register('name',{required:'Name is required'})} autoComplete="name" placeholder="Your name" className="auth-input" style={inputStyle}/></Field>}
            <Field icon={Mail} label="Email" error={form.formState.errors.email?.message}><input {...form.register('email',{required:'Email is required',pattern:{value:/^\S+@\S+\.\S+$/,message:'Enter a valid email'}})} type="email" autoComplete="email" placeholder="you@example.com" className="auth-input" style={inputStyle}/></Field>
            {mode!=='forgot'&&<Field icon={Lock} label="Password" error={form.formState.errors.password?.message}><div className="relative w-full min-w-0"><input {...form.register('password',{required:'Password is required',minLength:{value:8,message:'Minimum 8 characters'}})} type={showPassword?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} placeholder="Enter your password" className="auth-input" style={inputStyle}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></Field>}
            {mode==='signup'&&<Field icon={Lock} label="Confirm password" error={form.formState.errors.confirmPassword?.message}><input {...form.register('confirmPassword',{required:'Confirm your password'})} type="password" autoComplete="new-password" placeholder="Repeat your password" className="auth-input" style={inputStyle}/></Field>}
            {mode==='login'&&<div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-violet-600"/> Remember me</label><button type="button" onClick={()=>setMode('forgot')} className="font-medium text-violet-600 hover:text-violet-700">Forgot password?</button></div>}
            <button disabled={loading} className="h-[52px] w-full rounded-[14px] bg-gradient-to-r from-violet-600 to-indigo-600 text-[15px] font-semibold text-white shadow-[0_10px_25px_rgba(99,74,220,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(99,74,220,.28)] disabled:opacity-60">{loading?'Please wait…':mode==='login'?'Sign in':mode==='signup'?'Create account':'Send reset link'} {!loading&&<ArrowRight className="ml-2 inline" size={17}/>}</button>
            {mode==='login'&&<button type="button" onClick={fillDemo} disabled={loading} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-violet-200 bg-white text-[15px] font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"><Sparkles size={16}/> Use demo account</button>}
          </form>
          <div className="mt-7 text-center text-sm text-slate-500">{mode==='login'?<>New here? <button onClick={()=>setMode('signup')} className="font-semibold text-violet-600 hover:underline">Create an account</button></>:<>Already have an account? <button onClick={()=>setMode('login')} className="font-semibold text-violet-600 hover:underline">Sign in</button></>}</div>
          {mode==='login'&&<div className="mt-8 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5"><div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm"><Sparkles size={17}/></div><div><p className="font-semibold text-[#171a32]">Just exploring?</p><p className="mt-1 text-xs leading-5 text-slate-500">Tap &ldquo;Use demo account&rdquo; to prefill demo credentials, then sign in to take a look around.</p></div></div></div>}
          <p className="mt-8 text-center text-[11px] text-slate-400">Protected by Supabase authentication • Your data stays private</p>
        </div>
      </section>
    </main>
  );
}

function Feature({icon:Icon,title,text}:{icon:React.ElementType;title:string;text:string}) { return <div className="flex items-start gap-4"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10 text-violet-300"><Icon size={18}/></div><div><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div></div>; }

function Field({icon:Icon,label,error,children}:{icon:React.ElementType;label:string;error?:string;children:React.ReactNode}) { return <div className="w-full min-w-0"><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label><div className="relative w-full min-w-0" style={{width:'100%',minWidth:'100%'}}><Icon size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"/>{children}</div>{error&&<p className="mt-1 text-xs text-red-500">{error}</p>}</div>; }
