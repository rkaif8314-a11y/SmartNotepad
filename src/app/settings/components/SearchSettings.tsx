'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { type AppSettings } from './SettingsShell';
import SettingsToggle from './SettingsToggle';

interface Props {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const PROVIDERS: { value: AppSettings['searchProvider']; label: string; description: string; url: string }[] = [
  { value: 'google', label: 'Google', description: 'Most comprehensive results', url: 'google.com' },
  { value: 'bing', label: 'Bing', description: 'Microsoft search with AI features', url: 'bing.com' },
  { value: 'duckduckgo', label: 'DuckDuckGo', description: 'Privacy-focused search', url: 'duckduckgo.com' },
];

export default function SearchSettings({ settings, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      {/* API Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Globe size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Search API configuration</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Web search uses a secure server-side API route at <code className="bg-amber-100 px-1 rounded text-[11px]">/api/search</code>. Configure your search provider API key as an environment variable — never in frontend code.
          </p>
        </div>
      </div>

      {/* Search Provider */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Search Provider</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose which search engine powers your web search panel.</p>
        <div className="space-y-2">
          {PROVIDERS.map(p => (
            <button
              key={`provider-${p.value}`}
              onClick={() => onUpdate('searchProvider', p.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-150 ${
                settings.searchProvider === p.value
                  ? 'border-primary bg-secondary' :'border-border hover:border-primary/30 hover:bg-muted'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Globe size={16} className={settings.searchProvider === p.value ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${settings.searchProvider === p.value ? 'text-primary' : 'text-foreground'}`}>
                  {p.label}
                </p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{p.url}</span>
              {settings.searchProvider === p.value && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Result behavior */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Result Behavior</h3>
        <p className="text-xs text-muted-foreground mb-4">Control how search results are displayed and opened.</p>

        <div className="space-y-1 mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">Open results in</label>
          <div className="flex gap-2">
            {[
              { value: 'new-tab', label: 'New tab' },
              { value: 'same-tab', label: 'Same tab' },
            ].map(opt => (
              <button
                key={`open-${opt.value}`}
                onClick={() => onUpdate('openResultsIn', opt.value as AppSettings['openResultsIn'])}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-150 ${
                  settings.openResultsIn === opt.value
                    ? 'border-primary bg-secondary text-primary' :'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Display Options</h3>
        <SettingsToggle
          label="Show result snippets"
          description="Display a short description below each search result title"
          checked={settings.showSnippets}
          onChange={v => onUpdate('showSnippets', v)}
        />
        <div className="h-px bg-border" />
        <SettingsToggle
          label="Show source domain"
          description="Display the website domain below each result"
          checked
          onChange={() => {}}
        />
        <div className="h-px bg-border" />
        <SettingsToggle
          label="Remember last search query"
          description="Pre-fill the search box with your last query when reopening"
         
          onChange={() => {}}
        />
      </div>
    </div>
  );
}