'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Type, Search, User, Keyboard, ChevronRight, ArrowLeft, LogOut, Save, RefreshCw } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import AppearanceSettings from './AppearanceSettings';
import EditorSettings from './EditorSettings';
import SearchSettings from './SearchSettings';
import AccountSettings from './AccountSettings';
import ShortcutsSettings from './ShortcutsSettings';

export type SettingsCategory = 'appearance' | 'editor' | 'search' | 'account' | 'shortcuts';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  autosave: boolean;
  autosaveDelay: number;
  fontFamily: 'dm-sans' | 'jetbrains-mono' | 'ibm-plex-sans';
  lineHeight: 'compact' | 'normal' | 'relaxed';
  spellCheck: boolean;
  wordWrap: boolean;
  searchProvider: 'google' | 'bing' | 'duckduckgo';
  openResultsIn: 'new-tab' | 'same-tab';
  showSnippets: boolean;
  showWordCount: boolean;
  compactMode: boolean;
  notifications: boolean;
  name: string;
  email: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light', fontSize: 15, autosave: true, autosaveDelay: 800,
  fontFamily: 'dm-sans', lineHeight: 'normal', spellCheck: true, wordWrap: true,
  searchProvider: 'google', openResultsIn: 'new-tab', showSnippets: true,
  showWordCount: true, compactMode: false, notifications: true,
  name: 'Maya Chen', email: 'maya.chen@smartnotepad.io',
};

const SETTINGS_KEY = 'smartnotepad_settings';
function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try { const raw = localStorage.getItem(SETTINGS_KEY); return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS; }
  catch { return DEFAULT_SETTINGS; }
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
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => setSettings(loadSettings()), []);
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') root.classList.add('dark');
    else if (settings.theme === 'light') root.classList.remove('dark');
    else window.matchMedia('(prefers-color-scheme: dark)').matches ? root.classList.add('dark') : root.classList.remove('dark');
  }, [settings.theme]);
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => { setSettings(prev => ({ ...prev, [key]: value })); setIsDirty(true); };
  const handleSave = async () => { setIsSaving(true); await new Promise(resolve => setTimeout(resolve, 350)); localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); setIsDirty(false); setIsSaving(false); toast.success('Settings saved'); };
  const handleReset = () => { setSettings(DEFAULT_SETTINGS); setIsDirty(true); toast.info('Defaults restored — save when ready'); };
  const handleLogout = () => { toast.success('Signed out successfully'); router.push('/'); };
  const activeNav = NAV_ITEMS.find(item => item.key === active)!;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 h-[72px] border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="h-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => router.push('/dashboard')} className="app-control px-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /><span className="hidden sm:inline">Back to Notes</span></button>
            <div className="hidden sm:block h-7 w-px bg-border" />
            <div className="flex items-center gap-2.5 min-w-0"><AppLogo size={30} /><div className="min-w-0"><p className="font-semibold tracking-tight truncate">SmartNotepad</p><p className="text-[11px] text-muted-foreground truncate">Workspace settings</p></div></div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDirty && <span className="hidden md:inline-flex items-center gap-2 text-xs text-amber-600"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes</span>}
            <button onClick={handleReset} className="app-control px-3 flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw size={14} /><span className="hidden sm:inline">Reset</span></button>
            <button onClick={handleSave} disabled={!isDirty || isSaving} className="app-primary h-[38px] px-4 flex items-center gap-2 text-sm font-semibold disabled:opacity-45 disabled:cursor-not-allowed">{isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}{isSaving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      </header>
      <div className="flex-1 w-full max-w-[1500px] mx-auto flex min-h-0">
        <aside className="hidden lg:flex w-[272px] shrink-0 border-r border-border bg-card/60 py-7 px-3 flex-col">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Preferences</p>
          <nav className="space-y-1">{NAV_ITEMS.map(item => <button key={item.key} onClick={() => setActive(item.key)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${active === item.key ? 'bg-secondary text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${active === item.key ? 'bg-card text-primary' : 'bg-muted/70'}`}><item.icon size={17} /></span><span className="flex-1 min-w-0"><span className="block text-sm font-semibold">{item.label}</span><span className="block mt-0.5 text-[11px] truncate text-muted-foreground">{item.description}</span></span>{active === item.key && <ChevronRight size={15} className="shrink-0" />}</button>)}</nav>
          <div className="mt-auto pt-5 border-t border-border"><button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><LogOut size={15} /> Sign out</button></div>
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
          <div className="lg:hidden sticky top-0 z-20 px-4 py-3 bg-card/95 backdrop-blur border-b border-border overflow-x-auto scrollbar-thin flex gap-2">{NAV_ITEMS.map(item => <button key={item.key} onClick={() => setActive(item.key)} className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold ${active === item.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><item.icon size={13} className="inline mr-1.5" />{item.label}</button>)}</div>
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-10">
            <div className="mb-7 flex items-end justify-between gap-4"><div><div className="text-xs font-semibold text-primary mb-1">Preferences</div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{activeNav.label}</h1><p className="mt-1 text-sm text-muted-foreground">{activeNav.description}</p></div><div className="hidden sm:grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><activeNav.icon size={21} /></div></div>
            {active === 'appearance' && <AppearanceSettings settings={settings} onUpdate={updateSetting} />}
            {active === 'editor' && <EditorSettings settings={settings} onUpdate={updateSetting} />}
            {active === 'search' && <SearchSettings settings={settings} onUpdate={updateSetting} />}
            {active === 'account' && <AccountSettings settings={settings} onUpdate={updateSetting} onLogout={handleLogout} />}
            {active === 'shortcuts' && <ShortcutsSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
