'use client';

import React, { useMemo } from 'react';
import {
  FileText, Pin, Star, Clock, Plus, Search,
  TrendingUp, Folder, ArrowRight
} from 'lucide-react';
import { type Note, type Folder as FolderType, formatRelativeTime } from '@/lib/notesStorage';
import NotesActivityChart from './NotesActivityChart';

interface Props {
  notes: Note[];
  folders: FolderType[];
  onCreateNote: () => void;
  onSelectNote: (id: string) => void;
  onOpenSearch: () => void;
}

export default function DashboardHome({ notes, folders, onCreateNote, onSelectNote, onOpenSearch }: Props) {
  const pinned = notes.filter(n => n.isPinned);
  const favorites = notes.filter(n => n.isFavorite);
  const recent = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const totalWords = useMemo(() => notes.reduce((acc, n) => acc + n.wordCount, 0), [notes]);

  // Activity data for last 7 days
  const activityData = useMemo(() => {
    const days: { day: string; notes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date('2026-08-18T22:41:28Z');
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      const count = notes.filter(n => n.updatedAt.startsWith(dateStr)).length;
      days.push({ day: dayStr, notes: count });
    }
    return days;
  }, [notes]);

  const kpiCards = [
    { label: 'Total Notes', value: notes.length, icon: FileText, color: 'text-primary', bg: 'bg-secondary' },
    { label: 'Pinned', value: pinned.length, icon: Pin, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Favorites', value: favorites.length, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Total Words', value: totalWords.toLocaleString(), icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Good evening</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {notes.length} note{notes.length !== 1 ? 's' : ''} across {folders.length} folder{folders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
            >
              <Search size={15} />
              Search web
            </button>
            <button
              onClick={onCreateNote}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150"
            >
              <Plus size={15} />
              New Note
            </button>
          </div>
        </div>

        {/* KPI Grid — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map(card => (
            <div key={`kpi-${card.label}`} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all duration-150">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={16} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground font-mono-data">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Main grid: Activity chart + Recent notes + Pinned + Favorites */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Editing Activity</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <NotesActivityChart data={activityData} />
          </div>

          {/* Folders */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Folders</h2>
              <Folder size={15} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {folders.map(folder => {
                const count = notes.filter(n => n.folderId === folder.id).length;
                return (
                  <div key={`home-folder-${folder.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors duration-150">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${folder.color}20` }}>
                      <Folder size={14} style={{ color: folder.color }} />
                    </div>
                    <span className="text-sm text-foreground flex-1">{folder.name}</span>
                    <span className="text-xs text-muted-foreground font-mono-data">{count}</span>
                  </div>
                );
              })}
              {folders.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No folders yet</p>
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Recently Edited</h2>
              <Clock size={15} className="text-muted-foreground" />
            </div>
            <div className="space-y-1">
              {recent.map(note => {
                const snippet = note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
                return (
                  <button
                    key={`recent-${note.id}`}
                    onClick={() => onSelectNote(note.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors duration-150 text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                      {snippet && <p className="text-xs text-muted-foreground truncate">{snippet}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {note.isPinned && <Pin size={11} className="text-primary/60" />}
                      {note.isFavorite && <Star size={11} className="text-amber-500 fill-amber-500" />}
                      <span className="text-[11px] text-muted-foreground">{formatRelativeTime(note.updatedAt)}</span>
                      <ArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                    </div>
                  </button>
                );
              })}
              {recent.length === 0 && (
                <div className="text-center py-8">
                  <FileText size={24} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No notes yet</p>
                  <button onClick={onCreateNote} className="mt-2 text-xs text-primary hover:underline">Create your first note</button>
                </div>
              )}
            </div>
          </div>

          {/* Pinned + Favorites stacked */}
          <div className="space-y-4">
            {/* Pinned */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Pin size={14} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
                <span className="text-xs text-muted-foreground font-mono-data ml-auto">{pinned.length}</span>
              </div>
              {pinned.length === 0 ? (
                <p className="text-xs text-muted-foreground">No pinned notes. Pin important notes to see them here.</p>
              ) : (
                <div className="space-y-1">
                  {pinned.slice(0, 3).map(note => (
                    <button
                      key={`pinned-${note.id}`}
                      onClick={() => onSelectNote(note.id)}
                      className="w-full text-left text-xs text-foreground hover:text-primary px-2 py-1.5 rounded hover:bg-muted transition-colors duration-150 truncate"
                    >
                      {note.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites */}
            <div className="bg-card border border-amber-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <h2 className="text-sm font-semibold text-foreground">Favorites</h2>
                <span className="text-xs text-muted-foreground font-mono-data ml-auto">{favorites.length}</span>
              </div>
              {favorites.length === 0 ? (
                <p className="text-xs text-muted-foreground">No favorites. Star notes you want to revisit quickly.</p>
              ) : (
                <div className="space-y-1">
                  {favorites.slice(0, 3).map(note => (
                    <button
                      key={`fav-${note.id}`}
                      onClick={() => onSelectNote(note.id)}
                      className="w-full text-left text-xs text-foreground hover:text-amber-600 px-2 py-1.5 rounded hover:bg-amber-50 transition-colors duration-150 truncate"
                    >
                      {note.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}