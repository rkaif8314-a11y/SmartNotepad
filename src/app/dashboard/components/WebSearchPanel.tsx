'use client';

import React, { useState, useRef } from 'react';
import { Search, Loader2, AlertCircle, ExternalLink, Plus, Globe } from 'lucide-react';
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

// Mock search results for demonstration — Backend integration point:
// Replace with real /api/search endpoint call
const MOCK_RESULTS: Record<string, SearchResult[]> = {
  default: [
    {
      id: 'sr-001',
      title: 'Introduction to Machine Learning — Google Developers',
      snippet: 'Machine learning is a subfield of artificial intelligence that gives computers the ability to learn without being explicitly programmed. It focuses on developing algorithms that learn from data.',
      url: 'https://developers.google.com/machine-learning/intro-to-ml',
      domain: 'developers.google.com',
      displayUrl: 'developers.google.com/machine-learning/intro-to-ml',
    },
    {
      id: 'sr-002',
      title: 'What is Machine Learning? — IBM',
      snippet: 'Machine learning (ML) is a type of artificial intelligence (AI) that allows software applications to become more accurate at predicting outcomes without being explicitly programmed.',
      url: 'https://www.ibm.com/topics/machine-learning',
      domain: 'ibm.com',
      displayUrl: 'ibm.com/topics/machine-learning',
    },
    {
      id: 'sr-003',
      title: 'Machine Learning Crash Course — Google',
      snippet: 'A self-study guide for aspiring machine learning practitioners. Machine Learning Crash Course features a series of lessons with video lectures, real-world case studies, and hands-on practice exercises.',
      url: 'https://developers.google.com/machine-learning/crash-course',
      domain: 'developers.google.com',
      displayUrl: 'developers.google.com/machine-learning/crash-course',
    },
    {
      id: 'sr-004',
      title: 'Supervised vs Unsupervised Learning — Towards Data Science',
      snippet: 'The main difference between supervised and unsupervised learning is that supervised learning uses labeled training data while unsupervised learning uses unlabeled data to find hidden patterns.',
      url: 'https://towardsdatascience.com/supervised-vs-unsupervised-learning',
      domain: 'towardsdatascience.com',
      displayUrl: 'towardsdatascience.com/supervised-vs-unsupervised-learning',
    },
    {
      id: 'sr-005',
      title: 'Scikit-learn: Machine Learning in Python',
      snippet: 'Scikit-learn provides simple and efficient tools for predictive data analysis. It is accessible to everybody and reusable in various contexts, built on NumPy, SciPy, and Matplotlib.',
      url: 'https://scikit-learn.org/stable/',
      domain: 'scikit-learn.org',
      displayUrl: 'scikit-learn.org/stable',
    },
  ],
};

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=16&domain=${domain}`;
}

export default function WebSearchPanel({ onInsertIntoNote, hasActiveNote }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const [insertedIds, setInsertedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setState('loading');
    setResults([]);

    // Backend integration point: replace with real API call
    // const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    // const data = await res.json();
    await new Promise(r => setTimeout(r, 1200));

    // Simulate results based on query
    const mockKey = Object.keys(MOCK_RESULTS).find(k => q.toLowerCase().includes(k)) ?? 'default';
    const data = MOCK_RESULTS[mockKey] ?? MOCK_RESULTS.default;

    if (data.length === 0) {
      setState('empty');
    } else {
      setResults(data);
      setState('results');
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Input */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search the web… (Enter)"
            className="w-full pl-9 pr-10 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
          />
          {query && (
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
            >
              <Search size={12} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
          <Globe size={11} />
          Results open in a new tab. Use &quot;Insert&quot; to add to your note.
        </p>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Idle */}
        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Search the web</p>
            <p className="text-xs text-muted-foreground">Type a query above and press Enter to find information without leaving your note.</p>
          </div>
        )}

        {/* Loading */}
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Searching the web…</p>
          </div>
        )}

        {/* Empty */}
        {state === 'empty' && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center py-12">
            <AlertCircle size={24} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No results found</p>
            <p className="text-xs text-muted-foreground">Try different keywords or check your search query.</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center py-12">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Search failed</p>
            <p className="text-xs text-muted-foreground mb-3">Could not connect to the search service. Check your connection and try again.</p>
            <button
              onClick={handleSearch}
              className="text-xs text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {state === 'results' && (
          <div className="px-3 py-3 space-y-2">
            <p className="text-[11px] text-muted-foreground px-1 mb-2">
              {results.length} results for &quot;<span className="text-foreground font-medium">{query}</span>&quot;
            </p>
            {results.map(result => (
              <div
                key={`search-result-${result.id}`}
                className="search-result-card rounded-lg border border-border p-3 cursor-pointer"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline leading-tight flex-1"
                    onClick={e => e.stopPropagation()}
                  >
                    {result.title}
                  </a>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1 rounded hover:bg-border text-muted-foreground hover:text-foreground transition-colors duration-150"
                    title="Open in new tab"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Domain */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFaviconUrl(result.domain)}
                    alt={`${result.domain} favicon`}
                    width={12}
                    height={12}
                    className="rounded-sm"
                  />
                  <span className="text-[11px] text-muted-foreground truncate">{result.displayUrl}</span>
                </div>

                {/* Snippet */}
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 line-clamp-3">
                  {result.snippet}
                </p>

                {/* Insert button */}
                <button
                  onClick={() => handleInsert(result)}
                  disabled={!hasActiveNote}
                  className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md transition-all duration-150 ${
                    insertedIds.has(result.id)
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : hasActiveNote
                      ? 'bg-secondary text-primary hover:bg-primary hover:text-primary-foreground border border-transparent'
                      : 'bg-muted text-muted-foreground cursor-not-allowed border border-transparent'
                  }`}
                  title={hasActiveNote ? 'Insert into current note' : 'Open a note first'}
                >
                  <Plus size={11} />
                  {insertedIds.has(result.id) ? 'Inserted ✓' : 'Insert into Note'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}