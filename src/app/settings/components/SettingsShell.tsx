'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Palette, Type, Search, User, Keyboard, ChevronRight, ArrowLeft, LogOut, Save, RefreshCw } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import AppearanceSettings from './AppearanceSettings';
import EditorSettings from './EditorSettings';
import SearchSettings from './SearchSettings';
import AccountSettings from './AccountSettings';
import ShortcutsSettings from './ShortcutsSettings';
import { supabase } from '@/lib/supabase';
import { DEMO_STORAGE_USER, isDemoSession, setActiveStorageUser, setDemoSession } from '@/lib/notesStorage';

export type SettingsCategory = 'appearance' | 'editor' | 'search' | 'account' | 'shortcuts';
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'; fontSize: number; autosave: boolean; autosaveDelay: number;
  fontFamily: 'dm-sans' | 'jetbrains-mono' | 'ibm-plex-sans'; lineHeight: 'compact' | 'normal' | 'relaxed';
  spellCheck: boolean; wordWrap: boolean; searchProvider: 'google' | 'bing' | 'duckduckgo';
  openResultsIn: 'new-tab' | 'same-tab'; showSnippets: boolean; showWordCount: boolean; compactMode: boolean;
  accentColor: string; notifications: boolean; name: string; email: string;
}

const BASE_DEFAULTS: Omit<AppSettings, 'name' | 'email'> = {
  theme: 'light', fontSize: 15, autosave: true, autosaveDelay: 800, fontFamily: 'dm-sans', lineHeight: 'normal',
  spellCheck: true, wordWrap: true, searchProvider: 'google', openResultsIn: 'new-tab', showSnippets: true,
  showWordCount: true, compactMode: false, accentColor: '#5b4df6', notifications: true,
};

function settingsKey(userId: string) { return `smartnotepad_settings_${userId}`; }

function loadSettings(userId: string, name: string, email: string): AppSettings {
  const defaults: AppSettings = { ...BASE_DEFAULTS, name, email };
  if (typeof window === 'undefined' || userId === DEMO_STORAGE_USER) return defaults;
  try {
    const raw = localStorage.getItem(settingsKey(userId));
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<AppSettings>;
    return { ...defaults, ...saved, name, email };
  } catch { return defaults; }
}

const NAV_ITEMS: { key: SettingsCategory; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme, colors, display' },
  { key: 'editor', label: 'Editor', icon: Type, description: 'Font, autosave, formatting' },
  { key: 'search', label: 'Web Search', icon: Search, description: 'Search provider, results' },
  { key: 'account', label: 'Account', icon: User, description: 'Profile, security, logout' },
  { key: 'shortcuts', label: 'Shortcuts', icon: Keyboard, description: 'Keyboard shortcuts reference' },
];

export default function SettingsShell() {
  const router = useRouter();
  const [active, setActive] = useState<SettingsCategory>('appearance');
  const [settings, setSettings] = useState<AppSettings>({ ...BASE_DEFAULTS, name: '', email: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isDemoSession()) {
      setActiveStorageUser(DEMO_STORAGE_USER);
      setUserId(DEMO_STORAGE_USER);
      setSettings(loadSettings(DEMO_STORAGE_USER, 'Demo User', 'demo@smartnotepad.app'));
      return () => { mounted = false; };
    }
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data.user) { router.replace('/'); return; }
      const user = data.user;
      setUserId(user.id);
      setActiveStorageUser(user.id);
      const metadata = user.user_metadata as Record<string, unknown> | undefined;
      const name = typeof metadata?.full_name === 'string' && metadata.full_name.trim() ? metadata.full_name.trim() : (user.email?.split('@')[0] || 'User');
      setSettings(loadSettings(user.id, name, user.email || ''));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isDemoSession()) { setActiveStorageUser(null); router.replace('/'); }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [router]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') root.classList.add('dark');
    else if (settings.theme === 'light') root.classList.remove('dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.setProperty('--primary', settings.accentColor);
  }, [settings.theme, settings.accentColor]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    if (userId !== DEMO_STORAGE_USER) localStorage.setItem(settingsKey(userId), JSON.stringify(settings));
    setIsDirty(false);
    setIsSaving(false);
    toast.success('Settings saved');
  };

  const handleReset = () => {
    if (!userId) return;
    setSettings(loadSettings(userId, settings.name, settings.email));
    setIsDirty(true);
    toast.info('Saved settings restored');
  };

  const handleLogout = async () => {
    const id = userId;
    setActiveStorageUser(null);
    setDemoSession(false);
    if (id && id !== DEMO_STORAGE_USER) {
      localStorage.removeItem(`smartnotepad_notes_v2_${id}`);
      localStorage.removeItem(`smartnotepad_folders_v2_${id}`);
    }
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) { toast.error(error.message); return; }
    toast.success('Signed out successfully');
    router.replace('/');
  };

  const activeNav = NAV_ITEMS.find(item => item.key === active)!;
  if (!userId) return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">Loading your account…</div>;

  return <div className="min-h-screen bg-background text-foreground flex flex-col">
    <header className="sticky top-0 z-30 h-[72px] border-b border-border bg-card/95 backdrop-blur-xl"><div className="h-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4"><div className="flex items-center gap-4 min-w-0"><button onClick={() => router.push('/dashboard')} className="app-control px-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/><span className="hidden sm:inline">Back to Notes</span></button><div className="hidden sm:block h-7 w-px bg-border"/><div className="flex items-center gap-2.5 min-w-0"><AppLogo size={30}/><div className="min-w-0"><p className="font-semibold tracking-tight truncate">SmartNotepad</p><p className="text-[11px] text-muted-foreground truncate">Workspace settings</p></div></div></div><div className="flex items-center gap-2 shrink-0">{isDirty&&<span className="hidden md:inline-flex items-center gap-2 text-xs text-amber-600"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"/> Unsaved changes</span>}<button onClick={handleReset} className="app-control px-3 flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw size={14}/><span className="hidden sm:inline">Reset</span></button><button onClick={handleSave} disabled={!isDirty||isSaving} className="app-primary h-[38px] px-4 flex items-center gap-2 text-sm font-semibold disabled:opacity-45 disabled:cursor-not-allowed">{isSaving?<RefreshCw size={14} className="animate-spin"/>:<Save size={14}/>} {isSaving?'Saving…':'Save changes'}</button></div></div></header>
    <div className="flex-1 w-full max-w-[1500px] mx-auto flex min-h-0"><aside className="hidden lg:flex w-[272px] shrink-0 border-r border-border bg-card/60 py-7 px-3 flex-col"><p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Preferences</p><nav className="space-y-1">{NAV_ITEMS.map(item=><button key={item.key} onClick={()=>setActive(item.key)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${active===item.key?'bg-secondary text-primary shadow-sm':'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${active===item.key?'bg-card text-primary':'bg-muted/70'}`}><item.icon size={17}/></span><span className="flex-1 min-w-0"><span className="block text-sm font-semibold">{item.label}</span><span className="block mt-0.5 text-[11px] truncate text-muted-foreground">{item.description}</span></span>{active===item.key&&<ChevronRight size={15} className="shrink-0"/>}</button>)}</nav><div className="mt-auto pt-5 border-t border-border"><button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><LogOut size={15}/> Sign out</button></div></aside>
      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin"><div className="lg:hidden sticky top-0 z-20 px-4 py-3 bg-card/95 backdrop-blur border-b border-border overflow-x-auto scrollbar-thin flex gap-2">{NAV_ITEMS.map(item=><button key={item.key} onClick={()=>setActive(item.key)} className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold ${active===item.key?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground'}`}><item.icon size={13} className="inline mr-1.5"/>{item.label}</button>)}</div><div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-10"><div className="mb-7 flex items-end justify-between gap-4"><div><div className="text-xs font-semibold text-primary mb-1">Preferences</div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{activeNav.label}</h1><p className="mt-1 text-sm text-muted-foreground">{activeNav.description}</p></div><div className="hidden sm:grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><activeNav.icon size={21}/></div></div>{active==='appearance'&&<AppearanceSettings settings={settings} onUpdate={updateSetting}/>} {active==='editor'&&<EditorSettings settings={settings} onUpdate={updateSetting}/>} {active==='search'&&<SearchSettings settings={settings} onUpdate={updateSetting}/>} {active==='account'&&<AccountSettings settings={settings} onUpdate={updateSetting} onLogout={handleLogout}/>} {active==='shortcuts'&&<ShortcutsSettings/>}</div></main>
    </div></div>;
}
