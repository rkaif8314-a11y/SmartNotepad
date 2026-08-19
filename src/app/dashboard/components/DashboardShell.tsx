'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { loadNotes, saveNotes, loadFolders, saveFolders, countWords, type Note, type Folder } from '@/lib/notesStorage';
import NotesSidebar from './NotesSidebar';
import NoteEditor from './NoteEditor';
import WebSearchPanel from './WebSearchPanel';
import DashboardHome from './DashboardHome';
import FolderModal from './FolderModal';
import DeleteModal from './DeleteModal';
import { Menu, X, PanelRight } from 'lucide-react';

export type ActiveView = 'home' | 'editor';

export default function DashboardShell() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [insertContent, setInsertContent] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(loadNotes());
    setFolders(loadFolders());
  }, []);

  const persistNotes = useCallback((updated: Note[]) => {
    saveNotes(updated);
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      folderId: null,
      isPinned: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    persistNotes(updated);
    setActiveNoteId(newNote.id);
    setActiveView('editor');
    setMobileSidebarOpen(false);
    toast.success('New note created');
  }, [notes, persistNotes]);

  const updateNote = useCallback((id: string, changes: Partial<Note>) => {
    setNotes(prev => {
      const updated = prev.map(n => {
        if (n.id !== id) return n;
        const merged = {
          ...n,
          ...changes,
          updatedAt: new Date().toISOString(),
          wordCount: changes.content !== undefined ? countWords(changes.content) : n.wordCount,
        };
        return merged;
      });
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => persistNotes(updated), 800);
      return updated;
    });
  }, [persistNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      persistNotes(updated);
      return updated;
    });
    if (activeNoteId === id) {
      setActiveNoteId(null);
      setActiveView('home');
    }
    setDeleteTarget(null);
    toast.success('Note deleted');
  }, [activeNoteId, persistNotes]);

  const duplicateNote = useCallback((id: string) => {
    const source = notes.find(n => n.id === id);
    if (!source) return;
    const dup: Note = {
      ...source,
      id: `note-${Date.now()}`,
      title: `${source.title} (copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [dup, ...notes];
    setNotes(updated);
    persistNotes(updated);
    toast.success('Note duplicated');
  }, [notes, persistNotes]);

  const togglePin = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    updateNote(id, { isPinned: !note?.isPinned });
    toast.success(note?.isPinned ? 'Note unpinned' : 'Note pinned');
  }, [notes, updateNote]);

  const toggleFavorite = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    updateNote(id, { isFavorite: !note?.isFavorite });
    toast.success(note?.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  }, [notes, updateNote]);

  const createFolder = useCallback((name: string, color: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    saveFolders(updated);
    toast.success(`Folder "${name}" created`);
  }, [folders]);

  const handleInsertIntoNote = useCallback((text: string) => {
    if (!activeNoteId) {
      toast.error('Open a note first to insert content.');
      return;
    }
    setInsertContent(text);
    setActiveView('editor');
  }, [activeNoteId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'n') { e.preventDefault(); createNote(); }
      if (ctrl && e.key === 'f') { e.preventDefault(); setSearchQuery(''); }
      if (ctrl && e.shiftKey && e.key === 'F') { e.preventDefault(); setSearchPanelOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [createNote]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Notes Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        flex flex-col bg-card border-r border-border
        transition-all duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'w-[260px]' : 'w-[64px]'}
      `}>
        <NotesSidebar
          notes={notes}
          folders={folders}
          activeNoteId={activeNoteId}
          searchQuery={searchQuery}
          isCollapsed={!sidebarOpen}
          onSearchChange={setSearchQuery}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setActiveView('editor');
            setMobileSidebarOpen(false);
          }}
          onCreateNote={createNote}
          onTogglePin={togglePin}
          onToggleFavorite={toggleFavorite}
          onDuplicate={duplicateNote}
          onDelete={(id) => setDeleteTarget(id)}
          onToggleCollapse={() => setSidebarOpen(v => !v)}
          onCreateFolder={() => setShowFolderModal(true)}
          onGoHome={() => { setActiveView('home'); setActiveNoteId(null); setMobileSidebarOpen(false); }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
          >
            <Menu size={20} className="text-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {activeView === 'editor' && activeNote ? activeNote.title : 'SmartNotepad'}
          </span>
          <button
            onClick={() => setSearchPanelOpen(v => !v)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
          >
            <PanelRight size={20} className="text-foreground" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Center: Editor or Home */}
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${searchPanelOpen ? 'lg:mr-0' : ''}`}>
            {activeView === 'home' ? (
              <DashboardHome
                notes={notes}
                folders={folders}
                onCreateNote={createNote}
                onSelectNote={(id) => { setActiveNoteId(id); setActiveView('editor'); }}
                onOpenSearch={() => setSearchPanelOpen(true)}
              />
            ) : activeNote ? (
              <NoteEditor
                note={activeNote}
                folders={folders}
                onUpdate={updateNote}
                onTogglePin={() => togglePin(activeNote.id)}
                onToggleFavorite={() => toggleFavorite(activeNote.id)}
                onDelete={() => setDeleteTarget(activeNote.id)}
                onDuplicate={() => duplicateNote(activeNote.id)}
                onToggleSearch={() => setSearchPanelOpen(v => !v)}
                searchPanelOpen={searchPanelOpen}
                insertContent={insertContent}
                onInsertConsumed={() => setInsertContent(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center h-full text-muted-foreground text-sm">
                Select a note or create a new one
              </div>
            )}
          </div>

          {/* Right: Web Search Panel */}
          <div className={`
            fixed right-0 top-0 h-full lg:relative lg:top-auto lg:right-auto
            w-80 xl:w-96 bg-card border-l border-border
            transition-transform duration-300 ease-in-out z-30
            ${searchPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-full lg:w-0 lg:border-0'}
            overflow-hidden
          `}>
            {searchPanelOpen && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold text-foreground">Web Search</span>
                  <button
                    onClick={() => setSearchPanelOpen(false)}
                    className="p-1 rounded hover:bg-muted transition-colors duration-150"
                  >
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
                <WebSearchPanel
                  onInsertIntoNote={handleInsertIntoNote}
                  hasActiveNote={!!activeNoteId}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFolderModal && (
        <FolderModal
          onClose={() => setShowFolderModal(false)}
          onCreate={createFolder}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          noteTitle={notes.find(n => n.id === deleteTarget)?.title ?? 'this note'}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteNote(deleteTarget)}
        />
      )}
    </div>
  );
}