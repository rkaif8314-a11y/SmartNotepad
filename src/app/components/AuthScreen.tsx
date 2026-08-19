'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Copy,
  CheckCircle, BookOpen, Search, Sparkles, Shield
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

type AuthMode = 'login' | 'signup' | 'forgot';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface ForgotForm {
  email: string;
}

const DEMO_CREDENTIALS = [
  { role: 'Writer', email: 'maya.chen@smartnotepad.io', password: 'Writer@2026' },
  { role: 'Researcher', email: 'arjun.patel@smartnotepad.io', password: 'Research@2026' },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-secondary transition-colors duration-150 text-muted-foreground hover:text-primary"
      title="Copy to clipboard"
      type="button"
    >
      {copied ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false } });
  const forgotForm = useForm<ForgotForm>({ defaultValues: { email: '' } });

  // Backend integration point: replace with real auth API call
  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const valid = DEMO_CREDENTIALS.find(c => c.email === data.email && c.password === data.password);
    if (!valid) {
      loginForm.setError('email', { message: 'Invalid credentials — use the demo accounts below to sign in' });
      setIsLoading(false);
      return;
    }
    toast.success(`Welcome back, ${valid.role}!`);
    router.push('/dashboard');
  };

  const handleSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    toast.success('Account created! Welcome to SmartNotepad.');
    router.push('/dashboard');
  };

  const handleForgot = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setForgotSent(true);
  };

  const handleDemo = () => {
    loginForm.setValue('email', DEMO_CREDENTIALS[0].email);
    loginForm.setValue('password', DEMO_CREDENTIALS[0].password);
    toast.info('Demo credentials filled in — click Sign In to continue.');
    setMode('login');
  };

  const fillCredential = (cred: typeof DEMO_CREDENTIALS[0]) => {
    loginForm.setValue('email', cred.email);
    loginForm.setValue('password', cred.password);
    setMode('login');
    toast.info(`${cred.role} credentials filled in.`);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 max-w-xl w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <AppLogo size={36} />
            <span className="font-semibold text-xl text-foreground tracking-tight">SmartNotepad</span>
          </div>

          {mode === 'login' && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in to continue to your notes.</p>
            </>
          )}
          {mode === 'signup' && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Create an account</h1>
              <p className="text-sm text-muted-foreground">Start writing and researching in seconds.</p>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Reset your password</h1>
              <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
            </>
          )}
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  suppressHydrationWarning
                  className="w-full pl-9 pr-4 py-2.5 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                  {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                  {...loginForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border accent-primary"
                  {...loginForm.register('remember')}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>

            <div className="relative flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              type="button"
              onClick={handleDemo}
              className="w-full flex items-center justify-center gap-2 border border-border bg-card text-foreground py-2.5 rounded-md text-sm font-medium hover:bg-muted active:scale-95 transition-all duration-150"
            >
              <Sparkles size={16} className="text-accent" />
              Try Demo Mode
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-primary font-medium hover:underline">
                Sign up free
              </button>
            </p>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="signup-name">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full pl-9 pr-4 py-2.5 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                  {...signupForm.register('name', { required: 'Name is required' })}
                />
              </div>
              {signupForm.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="signup-email">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                  {...signupForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
                />
              </div>
              {signupForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="signup-password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                  {...signupForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {signupForm.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="signup-confirm">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-10 py-2.5 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                  {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {signupForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-border accent-primary"
                  {...signupForm.register('terms', { required: 'You must accept the terms' })}
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </span>
              </label>
              {signupForm.formState.errors.terms && (
                <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.terms.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* Forgot Password */}
        {mode === 'forgot' && !forgotSent && (
          <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="forgot-email">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                  {...forgotForm.register('email', { required: 'Email is required' })}
                />
              </div>
              {forgotForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{forgotForm.formState.errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-60"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => setMode('login')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'forgot' && forgotSent && (
          <div className="text-center space-y-4 fade-in">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Check your inbox — we sent a password reset link.</p>
            <button onClick={() => { setMode('login'); setForgotSent(false); }} className="text-sm text-primary hover:underline">
              Back to sign in
            </button>
          </div>
        )}

        {/* Demo Credentials Box — shown on login mode */}
        {mode === 'login' && (
          <div className="mt-6 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2.5 flex items-center gap-2">
              <Shield size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Demo Accounts</span>
            </div>
            <div className="divide-y divide-border">
              {DEMO_CREDENTIALS.map(cred => (
                <div key={`demo-${cred.role}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors duration-150">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-primary mr-3">{cred.role}</span>
                    <span className="text-xs text-muted-foreground font-mono-data truncate">{cred.email}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <CopyButton value={cred.email} />
                    <button
                      type="button"
                      onClick={() => fillCredential(cred)}
                      className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded hover:bg-primary hover:text-primary-foreground transition-all duration-150 font-medium"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Brand Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-accent/80 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 right-16 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-16 left-8 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-sm text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
            <BookOpen size={32} className="text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-semibold text-white mb-3">Write. Research. Remember.</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              SmartNotepad combines a distraction-free editor with live web search — so you never need to leave your note to find what you're looking for.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: BookOpen, label: 'Rich text editor with formatting' },
              { icon: Search, label: 'Search the web without leaving your note' },
              { icon: Sparkles, label: 'Insert search results directly into notes' },
            ].map(item => (
              <div key={`feature-${item.label}`} className="flex items-center gap-3 text-left bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm border border-white/10">
                <item.icon size={18} className="text-white/80 shrink-0" />
                <span className="text-sm text-white/90">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/40">Your notes are saved locally and securely.</p>
        </div>
      </div>
    </div>
  );
}