import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  domain: string;
  displayUrl: string;
}

const MAX_RESULTS = 10;
const TIMEOUT_MS = 7000;

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeUrl(raw: string): string | null {
  try {
    const decoded = decodeHtml(raw);
    const parsed = new URL(decoded, 'https://www.google.com');
    const target = parsed.searchParams.get('uddg') || parsed.searchParams.get('url');
    const finalUrl = target ? decodeURIComponent(target) : parsed.toString();
    if (!/^https?:\/\//i.test(finalUrl)) return null;
    return finalUrl;
  } catch { return null; }
}

function makeResult(url: string, title: string, snippet = ''): SearchResult | null {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    const domain = parsed.hostname.replace(/^www\./, '');
    if (!domain || domain === 'google.com' || domain.endsWith('.google.com') || domain === 'duckduckgo.com') return null;
    return {
      id: `web-${Buffer.from(normalized).toString('base64url').slice(0, 24)}`,
      title: decodeHtml(title) || domain,
      snippet: decodeHtml(snippet),
      url: normalized,
      domain,
      displayUrl: normalized.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    };
  } catch { return null; }
}

function dedupe(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter(result => {
    if (seen.has(result.url)) return false;
    seen.add(result.url);
    return true;
  }).slice(0, MAX_RESULTS);
}

function parseGoogle(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const pattern = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && results.length < MAX_RESULTS) {
    const title = decodeHtml(match[2]);
    if (title.length < 3 || /^(Images|Videos|News|Maps|Shopping|More)$/i.test(title)) continue;
    const result = makeResult(match[1], title);
    if (result) results.push(result);
  }
  return dedupe(results);
}

function parseDuckDuckGo(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const pattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && results.length < MAX_RESULTS) {
    const result = makeResult(match[1], match[2]);
    if (result) results.push(result);
  }
  return dedupe(results);
}

function parseDuckDuckGoLite(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const pattern = /<a[^>]+rel="nofollow"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && results.length < MAX_RESULTS) {
    const title = decodeHtml(match[2]);
    if (title.length < 3 || /^(Next|Previous)$/i.test(title)) continue;
    const result = makeResult(match[1], title);
    if (result) results.push(result);
  }
  return dedupe(results);
}

function parseJinaMarkdown(markdown: string): SearchResult[] {
  const results: SearchResult[] = [];
  const pattern = /\[([^\]]{3,180})\]\((https?:\/\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(markdown)) && results.length < MAX_RESULTS) {
    const result = makeResult(match[2], match[1]);
    if (result) results.push(result);
  }
  return dedupe(results);
}

async function fetchText(url: URL | string, referer = 'https://www.google.com/'): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
      Referer: referer,
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function searchGoogle(query: string) {
  const url = new URL('https://www.google.com/search');
  url.searchParams.set('q', query); url.searchParams.set('num', '10'); url.searchParams.set('hl', 'en');
  return parseGoogle(await fetchText(url));
}

async function searchDuckDuckGo(query: string) {
  const url = new URL('https://html.duckduckgo.com/html/');
  url.searchParams.set('q', query); url.searchParams.set('kl', 'wt-wt');
  return parseDuckDuckGo(await fetchText(url, 'https://duckduckgo.com/'));
}

async function searchDuckDuckGoLite(query: string) {
  const url = new URL('https://lite.duckduckgo.com/lite/');
  url.searchParams.set('q', query);
  return parseDuckDuckGoLite(await fetchText(url, 'https://lite.duckduckgo.com/'));
}

async function searchViaReader(query: string) {
  const target = new URL('https://www.google.com/search');
  target.searchParams.set('q', query); target.searchParams.set('num', '10'); target.searchParams.set('hl', 'en');
  return parseJinaMarkdown(await fetchText(`https://r.jina.ai/${target.toString()}`, 'https://r.jina.ai/'));
}

async function searchWikipedia(query: string): Promise<SearchResult[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query'); url.searchParams.set('list', 'search');
  url.searchParams.set('srsearch', query); url.searchParams.set('srlimit', String(MAX_RESULTS));
  url.searchParams.set('format', 'json'); url.searchParams.set('origin', '*');
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'User-Agent': 'SmartNotepad/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as { query?: { search?: Array<{ pageid: number; title: string; snippet: string }> } };
  return dedupe((data.query?.search ?? []).map(item => makeResult(
    `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
    item.title,
    item.snippet,
  )).filter((result): result is SearchResult => Boolean(result)));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!query) return NextResponse.json({ results: [], provider: 'web' });
  if (query.length > 200) return NextResponse.json({ error: 'Search query is too long.' }, { status: 400 });

  const providers: Array<[string, (q: string) => Promise<SearchResult[]>]> = [
    ['google', searchGoogle],
    ['duckduckgo', searchDuckDuckGo],
    ['duckduckgo-lite', searchDuckDuckGoLite],
    ['reader', searchViaReader],
    ['wikipedia', searchWikipedia],
  ];

  const errors: string[] = [];
  for (const [provider, search] of providers) {
    try {
      const results = await search(query);
      if (results.length) {
        return NextResponse.json(
          { results, provider, query },
          { headers: { 'Cache-Control': 'private, max-age=60' } },
        );
      }
      errors.push(`${provider}: no results`);
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : 'failed'}`);
      console.warn(`Web search provider ${provider} failed`, error);
    }
  }

  console.error('All web search providers failed', { query, errors });
  return NextResponse.json(
    { error: 'Live web search is temporarily unavailable. Please try again in a moment.', query },
    { status: 502 },
  );
}
