'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  notifications: boolean;
  name: string;
  email: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontSize: 15,
  autosave: true,
  autosaveDelay: 800,
  fontFamily: 'dm-sans',
  lineHeight: 'normal',
  spellCheck: true,
  wordWrap: true,
  searchProvider: 'google',
  openResultsIn: 'new-tab',
  showSnippets: true,
  notifications: true,
  name: 'Maya Chen',
  email: 'maya.chen@smartnotepad.io',
};

const SETTINGS_KEY = 'smartnotepad_settings';

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    // Backend integration point: persist settings to user profile
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setIsDirty(false);
    setIsSaving(false);
    toast.success('Settings saved');
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setIsDirty(true);
    toast.info('Settings reset to defaults — click Save to apply');
  };

  const handleLogout = () => {
    toast.success('Signed out successfully');
    router.push('/');
  };

  const activeNav = NAV_ITEMS.find(n => n.key === active)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Notes</span>
          </button>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <AppLogo size={24} />
            <span className="text-sm font-semibold text-foreground">Settings</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-amber-500 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-md hover:bg-muted transition-all duration-150"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><RefreshCw size={14} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={14} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Sidebar Nav */}
        <div className="hidden lg:flex flex-col w-64 border-r border-border bg-card py-4 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-5 mb-3">Preferences</p>
          {NAV_ITEMS.map(item => (
            <button
              key={`settings-nav-${item.key}`}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-left transition-all duration-150 ${
                active === item.key
                  ? 'bg-secondary text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{item.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
              </div>
              {active === item.key && <ChevronRight size={14} className="shrink-0" />}
            </button>
          ))}

          <div className="mt-auto px-4 pt-4 border-t border-border mx-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile nav bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-border bg-card scrollbar-thin shrink-0 w-full">
          {NAV_ITEMS.map(item => (
            <button
              key={`settings-mobile-nav-${item.key}`}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                active === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={13} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-2xl mx-auto px-4 lg:px-10 py-8">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <activeNav.icon size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{activeNav.label}</h1>
                <p className="text-sm text-muted-foreground">{activeNav.description}</p>
              </div>
            </div>

            {active === 'appearance' && (
              <AppearanceSettings settings={settings} onUpdate={updateSetting} />
            )}
            {active === 'editor' && (
              <EditorSettings settings={settings} onUpdate={updateSetting} />
            )}
            {active === 'search' && (
              <SearchSettings settings={settings} onUpdate={updateSetting} />
            )}
            {active === 'account' && (
              <AccountSettings settings={settings} onUpdate={updateSetting} onLogout={handleLogout} />
            )}
            {active === 'shortcuts' && (
              <ShortcutsSettings />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}