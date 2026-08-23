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

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(raw: string): string | null {
  try {
    const decoded = decodeHtml(raw);
    const parsed = new URL(decoded, 'https://www.google.com');
    const googleTarget = parsed.searchParams.get('q') || parsed.searchParams.get('url');
    const ddgTarget = parsed.searchParams.get('uddg');
    const target = googleTarget || ddgTarget;
    const finalUrl = target ? decodeURIComponent(target) : parsed.toString();
    if (!/^https?:\/\//i.test(finalUrl)) return null;
    return finalUrl;
  } catch {
    return null;
  }
}

function makeResult(url: string, title: string, snippet: string): SearchResult | null {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    const domain = parsed.hostname.replace(/^www\./, '');
    if (!domain || domain === 'google.com' || domain.endsWith('.google.com')) return null;
    return {
      id: `web-${Buffer.from(normalized).toString('base64url').slice(0, 24)}`,
      title: decodeHtml(title) || domain,
      snippet: decodeHtml(snippet),
      url: normalized,
      domain,
      displayUrl: normalized.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    };
  } catch {
    return null;
  }
}

function parseGoogle(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const seen = new Set<string>();
  const linkPattern = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) && results.length < 10) {
    const rawHref = match[1];
    const title = decodeHtml(match[2]).replace(/\s+/g, ' ').trim();
    if (!title || title.length < 3) continue;
    const result = makeResult(rawHref, title, '');
    if (!result || seen.has(result.url)) continue;
    seen.add(result.url);
    results.push(result);
  }

  // Google result cards commonly expose the snippet in a div following the title.
  // If titles were found without snippets, enrich them from nearby text where possible.
  return results;
}

function parseDuckDuckGo(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const seen = new Set<string>();
  const linkPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) && results.length < 10) {
    const result = makeResult(match[1], match[2], '');
    if (!result || seen.has(result.url)) continue;
    seen.add(result.url);
    results.push(result);
  }

  return results;
}

async function fetchSearchPage(url: URL, referer: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      Referer: referer,
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  return response.text();
}

async function searchGoogle(query: string): Promise<SearchResult[]> {
  const url = new URL('https://www.google.com/search');
  url.searchParams.set('q', query);
  url.searchParams.set('num', '10');
  url.searchParams.set('hl', 'en');
  const html = await fetchSearchPage(url, 'https://www.google.com/');
  return parseGoogle(html);
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = new URL('https://html.duckduckgo.com/html/');
  url.searchParams.set('q', query);
  url.searchParams.set('kl', 'wt-wt');
  const html = await fetchSearchPage(url, 'https://duckduckgo.com/');
  return parseDuckDuckGo(html);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!query) return NextResponse.json({ results: [], provider: 'web' });
  if (query.length > 200) {
    return NextResponse.json({ error: 'Search query is too long.' }, { status: 400 });
  }

  try {
    let results: SearchResult[] = [];
    let provider = 'google';

    try {
      results = await searchGoogle(query);
    } catch (googleError) {
      console.warn('Google web search failed, trying DuckDuckGo:', googleError);
      provider = 'duckduckgo';
      results = await searchDuckDuckGo(query);
    }

    if (!results.length) {
      try {
        provider = 'duckduckgo';
        results = await searchDuckDuckGo(query);
      } catch (fallbackError) {
        console.error('All web search providers failed:', fallbackError);
      }
    }

    return NextResponse.json(
      { results, provider, query },
      { headers: { 'Cache-Control': 'private, max-age=60' } },
    );
  } catch (error) {
    console.error('Web search failed:', error);
    return NextResponse.json(
      { error: 'The web search service is temporarily unavailable. Please try again.' },
      { status: 502 },
    );
  }
}
