'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Plus, CheckCircle2 } from 'lucide-react';
import { loadNotes, type Note } from '@/lib/notesStorage';

function todayKey() { const d=new Date(); return d.toISOString().slice(0,10); }
function formatDate() { return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date()); }

export default function DailyPage() {
  const notes = useMemo<Note[]>(() => loadNotes(), []);
  const today = todayKey();
  const todayNotes = notes.filter(n => n.updatedAt.slice(0,10) === today && !n.deletedAt);
  return <main className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-xl"><div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 flex items-center gap-4"><Link href="/dashboard" className="app-control px-3 h-9 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15}/> Notes</Link><div className="h-6 w-px bg-border"/><div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"><CalendarDays size={17}/></div><div><h1 className="text-sm font-bold">Daily Notes</h1><p className="text-[11px] text-muted-foreground">{formatDate()}</p></div></div></header>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8"><section className="app-surface p-6 sm:p-8"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5"><div><p className="text-xs font-semibold text-primary">Today</p><h2 className="mt-1 text-3xl font-bold tracking-tight">What matters today?</h2><p className="mt-2 text-sm text-muted-foreground max-w-xl">Capture priorities, lessons, decisions, and quick thoughts. Your daily workspace stays connected to the rest of SmartNotepad.</p></div><Link href="/dashboard" className="app-primary h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold"><Plus size={15}/> New daily note</Link></div><div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3"><div className="rounded-xl border border-border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Notes today</p><p className="mt-2 text-2xl font-bold">{todayNotes.length}</p></div><div className="rounded-xl border border-border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Pinned today</p><p className="mt-2 text-2xl font-bold">{todayNotes.filter(n=>n.isPinned).length}</p></div><div className="rounded-xl border border-border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Words today</p><p className="mt-2 text-2xl font-bold">{todayNotes.reduce((sum,n)=>sum+n.wordCount,0).toLocaleString()}</p></div></div></section><section className="mt-5 app-surface p-5 sm:p-6"><div className="flex items-center gap-2 mb-4"><CheckCircle2 size={16} className="text-primary"/><h2 className="text-sm font-bold">Today's notes</h2></div>{todayNotes.length ? <div className="space-y-2">{todayNotes.map(note=><Link key={note.id} href={`/dashboard?note=${encodeURIComponent(note.id)}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors"><span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{note.title}</span><span className="block mt-1 text-xs text-muted-foreground truncate">{note.wordCount.toLocaleString()} words</span></span><span className="text-xs text-primary">Open</span></Link>)}</div> : <p className="text-sm text-muted-foreground py-8 text-center">No notes updated today yet. Start one from the dashboard.</p>}</section></div>
  </main>;
}
