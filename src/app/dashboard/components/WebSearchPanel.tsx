'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, ExternalLink, Globe, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  domain: string;
  displayUrl: string;
}

interface Props {
  onInsertIntoNote: (content: string) => void;
  hasActiveNote: boolean;
}

type SearchState = 'idle' | 'loading' | 'results' | 'error' | 'empty';

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(domain)}`;
}

export default function WebSearchPanel({ onInsertIntoNote, hasActiveNote }: Props) {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [insertedIds, setInsertedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }

    setState('loading');
    setResults([]);
    setErrorMessage('');
    setSearchedQuery(q);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = await response.json() as { results?: SearchResult[]; error?: string };

      if (!response.ok) throw new Error(data.error || 'Search failed.');

      const nextResults = Array.isArray(data.results) ? data.results : [];
      setResults(nextResults);
      setState(nextResults.length ? 'results' : 'empty');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not search the web.');
      setState('error');
    }
  };

  const handleInsert = (result: SearchResult) => {
    if (!hasActiveNote) {
      toast.error('Open a note first to insert search results.');
      return;
    }
    const html = `<blockquote><strong><a href="${result.url}" target="_blank" rel="noopener noreferrer">${result.title}</a></strong><br/>${result.snippet}<br/><small style="color:var(--muted-foreground)">Source: ${result.domain}</small></blockquote>`;
    onInsertIntoNote(html);
    setInsertedIds(prev => new Set(prev).add(result.id));
    toast.success('Search result inserted into note');
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void handleSearch(); }}
            placeholder="Search anything on the web…"
            aria-label="Search the web"
            className="w-full rounded-lg border border-border bg-muted py-2.5 pl-9 pr-11 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => void handleSearch()}
            disabled={!query.trim() || state === 'loading'}
            aria-label="Search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary p-1.5 text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          </button>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Globe size={11} /> Live web results • Search again anytime • Insert results into your note
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {state === 'idle' && (
          <div className="grid h-full place-items-center px-6 py-12 text-center">
            <div>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted"><Search size={20} className="text-muted-foreground" /></div>
              <p className="mb-1 text-sm font-medium">Search the web</p>
              <p className="text-xs leading-5 text-muted-foreground">Try different questions, topics, websites or current information.</p>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="grid h-full place-items-center px-6 py-12 text-center">
            <div><Loader2 size={26} className="mx-auto mb-3 animate-spin text-primary" /><p className="text-sm font-medium">Searching live web results…</p><p className="mt-1 text-xs text-muted-foreground">Looking for pages relevant to “{searchedQuery}”</p></div>
          </div>
        )}

        {state === 'empty' && (
          <div className="grid h-full place-items-center px-6 py-12 text-center">
            <div><AlertCircle size={24} className="mx-auto mb-3 text-muted-foreground" /><p className="text-sm font-medium">No results found</p><p className="mt-1 text-xs text-muted-foreground">Try broader or different keywords.</p></div>
          </div>
        )}

        {state === 'error' && (
          <div className="grid h-full place-items-center px-6 py-12 text-center">
            <div><AlertCircle size={24} className="mx-auto mb-3 text-red-500" /><p className="text-sm font-medium">Search failed</p><p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{errorMessage || 'The search service is temporarily unavailable.'}</p><button onClick={() => void handleSearch()} className="mt-3 text-xs font-medium text-primary hover:underline">Try again</button></div>
          </div>
        )}

        {state === 'results' && (
          <div className="space-y-2 px-3 py-3">
            <div className="flex items-center justify-between px-1 pb-1">
              <p className="text-[11px] text-muted-foreground">{results.length} live results for <span className="font-medium text-foreground">“{searchedQuery}”</span></p>
              <button onClick={() => void handleSearch()} className="text-[11px] font-medium text-primary hover:underline">Refresh</button>
            </div>
            {results.map(result => (
              <article key={result.id} className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
                <div className="mb-1 flex items-start gap-2">
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs font-semibold leading-tight text-primary hover:underline">{result.title}</a>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Open result"><ExternalLink size={12} /></a>
                </div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getFaviconUrl(result.domain)} alt="" width={14} height={14} className="rounded-sm" />
                  <span className="truncate text-[11px] text-muted-foreground">{result.displayUrl}</span>
                </div>
                {result.snippet && <p className="mb-2 line-clamp-4 text-[11px] leading-relaxed text-muted-foreground">{result.snippet}</p>}
                <button
                  onClick={() => handleInsert(result)}
                  disabled={!hasActiveNote}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${insertedIds.has(result.id) ? 'border-green-200 bg-green-50 text-green-600' : hasActiveNote ? 'border-transparent bg-secondary text-primary hover:bg-primary hover:text-primary-foreground' : 'cursor-not-allowed border-transparent bg-muted text-muted-foreground'}`}
                  title={hasActiveNote ? 'Insert into current note' : 'Open a note first'}
                >
                  <Plus size={11} /> {insertedIds.has(result.id) ? 'Inserted ✓' : 'Insert into Note'}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
