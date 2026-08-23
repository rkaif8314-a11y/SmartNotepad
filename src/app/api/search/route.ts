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
    .replace(/<[^>]*>/g, '')
    .trim();
}

function stripTracking(url: string): string {
  try {
    const parsed = new URL(url, 'https://duckduckgo.com');
    const uddg = parsed.searchParams.get('uddg');
    if (uddg) return decodeURIComponent(uddg);
    return parsed.toString();
  } catch {
    return url;
  }
}

function parseDuckDuckGo(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const blocks = html.match(/<div[^>]*class="result[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi) ?? [];

  for (const block of blocks) {
    const linkMatch = block.match(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    const snippetMatch = block.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i)
      ?? block.match(/<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);

    const url = stripTracking(linkMatch[1]);
    if (!/^https?:\/\//i.test(url)) continue;

    let domain = '';
    try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch { continue; }

    results.push({
      id: `web-${Buffer.from(url).toString('base64url').slice(0, 24)}`,
      title: decodeHtml(linkMatch[2]),
      snippet: decodeHtml(snippetMatch?.[1] ?? ''),
      url,
      domain,
      displayUrl: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    });

    if (results.length >= 10) break;
  }

  return results;
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = new URL('https://html.duckduckgo.com/html/');
  url.searchParams.set('q', query);
  url.searchParams.set('kl', 'wt-wt');

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SmartNotepad/1.0; +https://smart-notepad-one.vercel.app)',
      Accept: 'text/html,application/xhtml+xml',
    },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Search provider returned ${response.status}`);
  const html = await response.text();
  return parseDuckDuckGo(html);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!query) return NextResponse.json({ results: [], provider: 'duckduckgo' });
  if (query.length > 200) return NextResponse.json({ error: 'Search query is too long.' }, { status: 400 });

  try {
    const results = await searchDuckDuckGo(query);
    return NextResponse.json(
      { results, provider: 'duckduckgo', query },
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
