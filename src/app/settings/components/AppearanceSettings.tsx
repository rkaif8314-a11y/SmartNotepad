'use client';

import React from 'react';
import { Sun, Moon, Monitor, Check, Sparkles } from 'lucide-react';
import { type AppSettings } from './SettingsShell';
import SettingsToggle from './SettingsToggle';

interface Props { settings: AppSettings; onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void; }

const THEMES: { value: AppSettings['theme']; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Clean and focused' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Comfortable at night' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Matches your device' },
];

const ACCENTS = [
  { name: 'Violet', value: '#5b4df6' }, { name: 'Blue', value: '#2563eb' }, { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#e11d48' }, { name: 'Amber', value: '#d97706' }, { name: 'Teal', value: '#0d9488' },
];

export default function AppearanceSettings({ settings, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <section className="app-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-5"><div><h3 className="text-base font-semibold">Theme</h3><p className="mt-1 text-sm text-muted-foreground">Choose the visual style that feels best for your workspace.</p></div><Sparkles size={18} className="text-primary shrink-0"/></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map(theme => { const selected = settings.theme === theme.value; return <button key={theme.value} onClick={() => onUpdate('theme', theme.value)} className={`relative text-left p-4 rounded-xl border-2 transition-all ${selected ? 'border-primary bg-secondary/70 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/50'}`}><div className="flex items-center justify-between"><span className={`grid h-9 w-9 place-items-center rounded-lg ${selected ? 'bg-card text-primary' : 'bg-muted text-muted-foreground'}`}><theme.icon size={18}/></span>{selected && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check size={12}/></span>}</div><p className={`mt-4 text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>{theme.label}</p><p className="mt-1 text-xs text-muted-foreground">{theme.description}</p></button>; })}
        </div>
      </section>

      <section className="app-surface p-5 sm:p-6">
        <div className="mb-5"><h3 className="text-base font-semibold">Accent color</h3><p className="mt-1 text-sm text-muted-foreground">Choose the color used for actions and active states.</p></div>
        <div className="flex flex-wrap gap-3">{ACCENTS.map(accent => <button key={accent.value} type="button" title={accent.name} onClick={() => document.documentElement.style.setProperty('--primary', accent.value)} className="h-10 w-10 rounded-full border-4 border-card ring-1 ring-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" style={{ background: accent.value }} />)}</div>
      </section>

      <section className="app-surface p-5 sm:p-6">
        <div className="mb-4"><h3 className="text-base font-semibold">Display</h3><p className="mt-1 text-sm text-muted-foreground">Fine-tune how much information SmartNotepad shows.</p></div>
        <div className="divide-y divide-border">
          <SettingsToggle label="Show word count" description="Display word and character counts below the editor" checked={settings.showWordCount} onChange={value => onUpdate('showWordCount', value)} />
          <SettingsToggle label="Compact note list" description="Use tighter spacing to show more notes at once" checked={settings.compactMode} onChange={value => onUpdate('compactMode', value)} />
          <SettingsToggle label="Show note snippets" description="Preview the first line of each note in the sidebar" checked={settings.showSnippets} onChange={value => onUpdate('showSnippets', value)} />
        </div>
      </section>
    </div>
  );
}
