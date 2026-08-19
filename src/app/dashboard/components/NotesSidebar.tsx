'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Pin, Star, Folder, Home,
  ChevronLeft, ChevronRight, MoreHorizontal,
  Trash2, Copy, PinOff, StarOff, FolderPlus,
  FileText, Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type Note, type Folder as FolderType, formatRelativeTime } from '@/lib/notesStorage';
import AppLogo from '@/components/ui/AppLogo';

type SortMode = 'newest' | 'oldest' | 'title' | 'favorites';
type FilterMode = 'all' | 'pinned' | 'favorites' | string;

interface Props {
  notes: Note[];
  folders: FolderType[];
  activeNoteId: string | null;
  searchQuery: string;
  isCollapsed: boolean;
  onSearchChange: (q: string) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCollapse: () => void;
  onCreateFolder: () => void;
  onGoHome: () => void;
}

export default function NotesSidebar({
  notes, folders, activeNoteId, searchQuery, isCollapsed,
  onSearchChange, onSelectNote, onCreateNote, onTogglePin,
  onToggleFavorite, onDuplicate, onDelete, onToggleCollapse,
  onCreateFolder, onGoHome,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    let list = notes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.replace(/<[^>]*>/g, '').toLowerCase().includes(q)
      );
    }

    if (filter === 'pinned') list = list.filter(n => n.isPinned);
    else if (filter === 'favorites') list = list.filter(n => n.isFavorite);
    else if (filter !== 'all') list = list.filter(n => n.folderId === filter);

    switch (sort) {
      case 'newest': return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case 'oldest': return [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'title': return [...list].sort((a, b) => a.title.localeCompare(b.title));
      case 'favorites': return [...list].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
      default: return list;
    }
  }, [notes, searchQuery, filter, sort]);

  const pinnedCount = notes.filter(n => n.isPinned).length;
  const favCount = notes.filter(n => n.isFavorite).length;

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full w-16 items-center py-4 gap-3">
        <div className="mb-2">
          <AppLogo size={28} />
        </div>
        <button
          onClick={onCreateNote}
          className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors duration-150"
          title="New Note (Ctrl+N)"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={onGoHome}
          className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150"
          title="Home"
        >
          <Home size={18} />
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150 ${filter === 'all' ? 'bg-secondary text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          title="All Notes"
        >
          <FileText size={18} />
        </button>
        <button
          onClick={() => setFilter('pinned')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150 ${filter === 'pinned' ? 'bg-secondary text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          title="Pinned"
        >
          <Pin size={18} />
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150 ${filter === 'favorites' ? 'bg-secondary text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          title="Favorites"
        >
          <Star size={18} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/settings')}
          className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150"
          title="Expand sidebar"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-[260px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="text-sm font-semibold text-foreground">SmartNotepad</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes… (Ctrl+F)"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-muted rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all duration-150"
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-2 shrink-0">
        <button
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-md text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150"
        >
          <Plus size={14} />
          New Note
        </button>
      </div>

      {/* Filter Nav */}
      <div className="px-3 pb-2 space-y-0.5 shrink-0">
        <button
          onClick={onGoHome}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
        >
          <Home size={14} />
          Home
        </button>
        {[
          { key: 'all', icon: FileText, label: 'All Notes', count: notes.length },
          { key: 'pinned', icon: Pin, label: 'Pinned', count: pinnedCount },
          { key: 'favorites', icon: Star, label: 'Favorites', count: favCount },
        ].map(item => (
          <button
            key={`filter-${item.key}`}
            onClick={() => setFilter(item.key as FilterMode)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
              filter === item.key
                ? 'bg-secondary text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon size={14} />
            <span className="flex-1 text-left">{item.label}</span>
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono-data">{item.count}</span>
          </button>
        ))}
      </div>

      {/* Folders */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1 px-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Folders</span>
          <button
            onClick={onCreateFolder}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
            title="New folder"
          >
            <FolderPlus size={12} />
          </button>
        </div>
        {folders.map(folder => (
          <button
            key={`folder-nav-${folder.id}`}
            onClick={() => setFilter(folder.id)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
              filter === folder.id
                ? 'bg-secondary text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Folder size={13} style={{ color: folder.color }} />
            <span className="flex-1 text-left truncate">{folder.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono-data">
              {notes.filter(n => n.folderId === folder.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center gap-1 px-2.5 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortMode)}
            className="text-[10px] bg-transparent text-muted-foreground border-none outline-none cursor-pointer hover:text-foreground"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title</option>
            <option value="favorites">Favorites</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <FileText size={24} className="text-muted-foreground mb-2 opacity-50" />
            <p className="text-xs font-medium text-muted-foreground">No notes yet</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">Create your first note to get started.</p>
            <button
              onClick={onCreateNote}
              className="mt-3 text-xs text-primary hover:underline"
            >
              + Create note
            </button>
          </div>
        ) : (
          filteredNotes.map(note => {
            const folder = folders.find(f => f.id === note.folderId);
            const snippet = note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
            return (
              <div
                key={`note-item-${note.id}`}
                className={`group relative rounded-lg px-3 py-2.5 mb-1 cursor-pointer note-card-hover ${
                  activeNoteId === note.id
                    ? 'bg-secondary border border-primary/20' :'hover:bg-muted border border-transparent'
                }`}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-foreground truncate flex-1 leading-tight">
                    {note.title}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {note.isPinned && <Pin size={11} className="text-primary/70" />}
                    {note.isFavorite && <Star size={11} className="text-amber-500 fill-amber-500" />}
                    <button
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-border transition-all duration-150"
                      onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === note.id ? null : note.id); }}
                    >
                      <MoreHorizontal size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {snippet && (
                  <p className="text-[11px] text-muted-foreground truncate mb-1">{snippet}</p>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground/70">{formatRelativeTime(note.updatedAt)}</span>
                  {folder && (
                    <span className="text-[10px] flex items-center gap-1" style={{ color: folder.color }}>
                      <Folder size={9} />
                      {folder.name}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground/60 ml-auto font-mono-data">{note.wordCount}w</span>
                </div>

                {/* Context Menu */}
                {openMenuId === note.id && (
                  <div
                    className="absolute right-2 top-8 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-40 fade-in"
                    onClick={e => e.stopPropagation()}
                  >
                    {[
                      { icon: note.isPinned ? PinOff : Pin, label: note.isPinned ? 'Unpin' : 'Pin note', action: () => { onTogglePin(note.id); setOpenMenuId(null); } },
                      { icon: note.isFavorite ? StarOff : Star, label: note.isFavorite ? 'Unfavorite' : 'Favorite', action: () => { onToggleFavorite(note.id); setOpenMenuId(null); } },
                      { icon: Copy, label: 'Duplicate', action: () => { onDuplicate(note.id); setOpenMenuId(null); } },
                      { icon: Trash2, label: 'Delete', action: () => { onDelete(note.id); setOpenMenuId(null); }, danger: true },
                    ].map(item => (
                      <button
                        key={`menu-${note.id}-${item.label}`}
                        onClick={item.action}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors duration-150 ${item.danger ? 'text-red-500 hover:text-red-600' : 'text-foreground'}`}
                      >
                        <item.icon size={13} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-2 shrink-0">
        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
        >
          <Settings size={14} />
          Settings
        </button>
      </div>
    </div>
  );
}