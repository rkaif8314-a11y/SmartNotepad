'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Network, FileText, Search, ArrowUpRight } from 'lucide-react';
import { loadNotes, type Note } from '@/lib/notesStorage';

function stripHtml(value: string) { return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }

export default function KnowledgePage() {
  const notes = useMemo<Note[]>(() => loadNotes(), []);
  const nodes = notes.filter(n => !n.deletedAt).slice(0, 40);
  const edges = useMemo(() => {
    const result: { from: Note; to: Note }[] = [];
    for (const from of nodes) {
      const haystack = `${from.title} ${stripHtml(from.content)}`.toLowerCase();
      for (const to of nodes) {
        if (from.id === to.id) continue;
        const title = to.title.trim().toLowerCase();
        if (title.length >= 3 && haystack.includes(title)) result.push({ from, to });
      }
    }
    return result.slice(0, 100);
  }, [nodes]);

  return <main className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center gap-4">
        <Link href="/dashboard" className="app-control px-3 h-9 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15}/> Notes</Link>
        <div className="h-6 w-px bg-border"/>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"><Network size={17}/></div>
        <div><h1 className="text-sm font-bold">Knowledge Graph</h1><p className="text-[11px] text-muted-foreground">Explore connections across your notes</p></div>
        <div className="ml-auto text-xs text-muted-foreground">{nodes.length} notes · {edges.length} connections</div>
      </div>
    </header>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {!nodes.length ? <section className="app-surface min-h-[60vh] grid place-items-center text-center p-8"><div><Network size={30} className="mx-auto text-primary"/><h2 className="mt-4 text-xl font-bold">Build your knowledge graph</h2><p className="mt-2 text-sm text-muted-foreground">Create a few notes with related titles and content to see connections here.</p><Link href="/dashboard" className="app-primary mt-5 inline-flex h-10 px-4 items-center gap-2 text-sm font-semibold">Create a note <ArrowUpRight size={15}/></Link></div></section> : <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-5">
        <section className="app-surface min-h-[650px] p-5 overflow-hidden"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold">Connected notes</h2><p className="text-xs text-muted-foreground mt-1">Connections are inferred from note titles and content.</p></div><Search size={16} className="text-muted-foreground"/></div><div className="relative min-h-[560px] rounded-2xl bg-muted/30 border border-border p-5"><div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">{nodes.map((note, index) => { const degree = edges.filter(e => e.from.id === note.id || e.to.id === note.id).length; return <Link key={note.id} href={`/dashboard?note=${encodeURIComponent(note.id)}`} className="group rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all"><div className="flex items-start gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><FileText size={14}/></span><span className="min-w-0"><span className="block text-xs font-semibold truncate">{note.title || 'Untitled'}</span><span className="mt-1 block text-[10px] text-muted-foreground">{degree} connection{degree===1?'':'s'}</span></span></div><p className="mt-2 text-[10px] leading-4 text-muted-foreground line-clamp-2">{stripHtml(note.content) || 'Empty note'}</p><span className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary opacity-0 group-hover:opacity-100">Open <ArrowUpRight size={10}/></span></Link>})}</div></div></section>
        <aside className="app-surface p-5 h-fit"><h2 className="text-sm font-bold">Connections</h2><p className="text-xs text-muted-foreground mt-1 mb-4">Detected relationships</p><div className="space-y-2 max-h-[560px] overflow-y-auto">{edges.length ? edges.map((edge, i) => <Link key={`${edge.from.id}-${edge.to.id}-${i}`} href={`/dashboard?note=${encodeURIComponent(edge.from.id)}`} className="block rounded-xl border border-border p-3 hover:bg-muted transition-colors"><p className="text-xs font-semibold truncate">{edge.from.title}</p><p className="text-[10px] text-muted-foreground my-1">links to</p><p className="text-xs font-semibold text-primary truncate">{edge.to.title}</p></Link>) : <p className="text-xs leading-5 text-muted-foreground">No automatic connections found yet. Mention another note's title inside your notes to create a relationship.</p>}</div></aside>
      </div>}
    </div>
  </main>;
}
