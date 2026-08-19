'use client';

import React from 'react';
import { type AppSettings } from './SettingsShell';
import SettingsToggle from './SettingsToggle';

interface Props {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const FONT_FAMILIES: { value: AppSettings['fontFamily']; label: string; preview: string }[] = [
  { value: 'dm-sans', label: 'DM Sans', preview: 'Clean and modern sans-serif' },
  { value: 'ibm-plex-sans', label: 'IBM Plex Sans', preview: 'Professional and readable' },
  { value: 'jetbrains-mono', label: 'JetBrains Mono', preview: 'Monospace for code-heavy notes' },
];

const LINE_HEIGHTS: { value: AppSettings['lineHeight']; label: string; px: string }[] = [
  { value: 'compact', label: 'Compact', px: '1.5' },
  { value: 'normal', label: 'Normal', px: '1.75' },
  { value: 'relaxed', label: 'Relaxed', px: '2.0' },
];

const AUTOSAVE_DELAYS: { value: number; label: string }[] = [
  { value: 300, label: '300ms (very fast)' },
  { value: 600, label: '600ms (fast)' },
  { value: 800, label: '800ms (default)' },
  { value: 1500, label: '1.5s (slow)' },
  { value: 3000, label: '3s (manual feel)' },
];

export default function EditorSettings({ settings, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      {/* Font size */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Font Size</h3>
        <p className="text-xs text-muted-foreground mb-4">Adjust the editor text size.</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={settings.fontSize}
            onChange={e => onUpdate('fontSize', Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-mono-data font-semibold text-primary w-10 text-center">
            {settings.fontSize}px
          </span>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
          <p className="text-muted-foreground" style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.75 }}>
            The quick brown fox jumps over the lazy dog. This is how your notes will look.
          </p>
        </div>
      </div>

      {/* Font Family */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Font Family</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose the typeface for your writing area.</p>
        <div className="space-y-2">
          {FONT_FAMILIES.map(f => (
            <button
              key={`font-${f.value}`}
              onClick={() => onUpdate('fontFamily', f.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-150 ${
                settings.fontFamily === f.value
                  ? 'border-primary bg-secondary' :'border-border hover:border-primary/30 hover:bg-muted'
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${settings.fontFamily === f.value ? 'text-primary' : 'text-foreground'}`}>
                  {f.label}
                </p>
                <p className="text-xs text-muted-foreground">{f.preview}</p>
              </div>
              {settings.fontFamily === f.value && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Line Spacing</h3>
        <p className="text-xs text-muted-foreground mb-4">Control the vertical spacing between lines.</p>
        <div className="grid grid-cols-3 gap-3">
          {LINE_HEIGHTS.map(lh => (
            <button
              key={`lh-${lh.value}`}
              onClick={() => onUpdate('lineHeight', lh.value)}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-150 ${
                settings.lineHeight === lh.value
                  ? 'border-primary bg-secondary' :'border-border hover:border-primary/30'
              }`}
            >
              <p className={`text-xs font-medium ${settings.lineHeight === lh.value ? 'text-primary' : 'text-foreground'}`}>
                {lh.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{lh.px}x</p>
            </button>
          ))}
        </div>
      </div>

      {/* Autosave */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Autosave</h3>
        <SettingsToggle
          label="Enable autosave"
          description="Automatically save notes as you type"
          checked={settings.autosave}
          onChange={v => onUpdate('autosave', v)}
        />
        {settings.autosave && (
          <>
            <div className="h-px bg-border" />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Autosave delay</label>
              <p className="text-xs text-muted-foreground mb-2">How long to wait after you stop typing before saving.</p>
              <select
                value={settings.autosaveDelay}
                onChange={e => onUpdate('autosaveDelay', Number(e.target.value))}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
              >
                {AUTOSAVE_DELAYS.map(d => (
                  <option key={`delay-${d.value}`} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Behavior */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Editor Behavior</h3>
        <SettingsToggle
          label="Spell check"
          description="Highlight misspelled words as you type"
          checked={settings.spellCheck}
          onChange={v => onUpdate('spellCheck', v)}
        />
        <div className="h-px bg-border" />
        <SettingsToggle
          label="Word wrap"
          description="Wrap long lines within the editor viewport"
          checked={settings.wordWrap}
          onChange={v => onUpdate('wordWrap', v)}
        />
      </div>
    </div>
  );
}