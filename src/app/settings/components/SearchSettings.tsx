'use client';

import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';
import { type AppSettings } from './SettingsShell';
import SettingsToggle from './SettingsToggle';

interface Props {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function SearchSettings({ settings, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <Globe size={17} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Live web search is enabled</p>
          <p className="mt-1 text-xs leading-5 text-blue-800/80 dark:text-blue-300/80">Every query now goes through SmartNotepad&apos;s server-side live search route instead of demo/mock data.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><ShieldCheck size={17} /></div>
          <div>
            <h3 className="text-sm font-semibold">Search provider</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">DuckDuckGo powers the built-in live search through the server. No search-provider API key is exposed in browser code.</p>
            <span className="mt-3 inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium">DuckDuckGo • Live</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-1 text-sm font-semibold">Result behavior</h3>
        <p className="mb-4 text-xs text-muted-foreground">Control how result links behave when opened.</p>
        <label className="mb-1 block text-sm font-medium">Open results in</label>
        <div className="flex gap-2">
          {[{ value: 'new-tab', label: 'New tab' }, { value: 'same-tab', label: 'Same tab' }].map(opt => (
            <button key={opt.value} onClick={() => onUpdate('openResultsIn', opt.value as AppSettings['openResultsIn'])} className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${settings.openResultsIn === opt.value ? 'border-primary bg-secondary text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>{opt.label}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Display options</h3>
        <SettingsToggle label="Show result snippets" description="Display a short description below each result title" checked={settings.showSnippets} onChange={v => onUpdate('showSnippets', v)} />
      </div>
    </div>
  );
}
