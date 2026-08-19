'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { type AppSettings } from './SettingsShell';
import SettingsToggle from './SettingsToggle';

interface Props {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const THEMES: { value: AppSettings['theme']; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Clean white interface' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes at night' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Follows your OS preference' },
];

export default function AppearanceSettings({ settings, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Theme</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose how SmartNotepad looks for you.</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(theme => (
            <button
              key={`theme-${theme.value}`}
              onClick={() => onUpdate('theme', theme.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 ${
                settings.theme === theme.value
                  ? 'border-primary bg-secondary' :'border-border hover:border-primary/40 hover:bg-muted'
              }`}
            >
              <theme.icon size={20} className={settings.theme === theme.value ? 'text-primary' : 'text-muted-foreground'} />
              <span className={`text-xs font-medium ${settings.theme === theme.value ? 'text-primary' : 'text-foreground'}`}>
                {theme.label}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{theme.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Display options */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Display</h3>
        <SettingsToggle
          label="Show word count"
          description="Display word and character count in the editor footer"
          checked
          onChange={() => {}}
        />
        <div className="h-px bg-border" />
        <SettingsToggle
          label="Compact note list"
          description="Show more notes in the sidebar with reduced spacing"
         
          onChange={() => {}}
        />
        <div className="h-px bg-border" />
        <SettingsToggle
          label="Show note snippets"
          description="Preview the first line of each note in the sidebar"
          checked
          onChange={() => {}}
        />
      </div>
    </div>
  );
}