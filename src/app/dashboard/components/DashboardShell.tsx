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
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, PanelRight, Search, Moon, Sun, Settings, Command, Plus, LayoutDashboard, FileText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type ActiveView = 'home' | 'editor';

export default function DashboardShell() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]); const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null); const [activeView, setActiveView] = useState<ActiveView>('home');
  const [searchQuery, setSearchQuery] = useState(''); const [sidebarOpen, setSidebarOpen] = useState(true); const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false); const [deleteTarget, setDeleteTarget] = useState<string | null>(null); const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [insertContent, setInsertContent] = useState<string | null>(null); const [commandOpen, setCommandOpen] = useState(false); const [darkMode, setDarkMode] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setNotes(loadNotes()); setFolders(loadFolders()); const stored = localStorage.getItem('smartnotepad_theme'); const dark = stored === 'dark'; setDarkMode(dark); if (dark) document.documentElement.classList.add('dark'); }, []);
  const persistNotes = useCallback((updated: Note[]) => saveNotes(updated), []);
  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;

  const createNote = useCallback(() => {
    const now = new Date().toISOString(); const newNote: Note = { id: `note-${Date.now()}`, title: 'Untitled Note', content: '', folderId: null, isPinned: false, isFavorite: false, createdAt: now, updatedAt: now, wordCount: 0 };
    const updated = [newNote, ...notes]; setNotes(updated); persistNotes(updated); setActiveNoteId(newNote.id); setActiveView('editor'); setMobileSidebarOpen(false); setCommandOpen(false); toast.success('New note created');
  }, [notes, persistNotes]);
  const updateNote = useCallback((id: string, changes: Partial<Note>) => { setNotes(prev => { const updated = prev.map(n => n.id !== id ? n : { ...n, ...changes, updatedAt: new Date().toISOString(), wordCount: changes.content !== undefined ? countWords(changes.content) : n.wordCount }); if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); saveTimeoutRef.current = setTimeout(() => persistNotes(updated), 700); return updated; }); }, [persistNotes]);
  const deleteNote = useCallback((id: string) => { setNotes(prev => { const updated = prev.filter(n => n.id !== id); persistNotes(updated); return updated; }); if (activeNoteId === id) { setActiveNoteId(null); setActiveView('home'); } setDeleteTarget(null); toast.success('Note deleted'); }, [activeNoteId, persistNotes]);
  const duplicateNote = useCallback((id: string) => { const source = notes.find(n => n.id === id); if (!source) return; const now = new Date().toISOString(); const dup: Note = { ...source, id: `note-${Date.now()}`, title: `${source.title} (copy)`, createdAt: now, updatedAt: now }; const updated = [dup, ...notes]; setNotes(updated); persistNotes(updated); toast.success('Note duplicated'); }, [notes, persistNotes]);
  const togglePin = useCallback((id: string) => { const note = notes.find(n => n.id === id); updateNote(id, { isPinned: !note?.isPinned }); toast.success(note?.isPinned ? 'Note unpinned' : 'Note pinned'); }, [notes, updateNote]);
  const toggleFavorite = useCallback((id: string) => { const note = notes.find(n => n.id === id); updateNote(id, { isFavorite: !note?.isFavorite }); toast.success(note?.isFavorite ? 'Removed from favorites' : 'Added to favorites'); }, [notes, updateNote]);
  const createFolder = useCallback((name: string, color: string) => { const folder: Folder = { id: `folder-${Date.now()}`, name, color, createdAt: new Date().toISOString() }; const updated = [...folders, folder]; setFolders(updated); saveFolders(updated); toast.success(`Folder "${name}" created`); }, [folders]);
  const handleInsertIntoNote = useCallback((text: string) => { if (!activeNoteId) { toast.error('Open a note first to insert content.'); return; } setInsertContent(text); setActiveView('editor'); }, [activeNoteId]);
  const toggleTheme = () => { const next = !darkMode; setDarkMode(next); document.documentElement.classList.toggle('dark', next); localStorage.setItem('smartnotepad_theme', next ? 'dark' : 'light'); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { const ctrl = e.ctrlKey || e.metaKey; if (ctrl && e.key.toLowerCase() === 'n') { e.preventDefault(); createNote(); } if (ctrl && e.key.toLowerCase() === 'k') { e.preventDefault(); setCommandOpen(v => !v); } if (ctrl && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); setSearchPanelOpen(true); } if (e.key === 'Escape') { setCommandOpen(false); setMobileSidebarOpen(false); } };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [createNote]);

  return <div className="flex h-screen bg-background overflow-hidden text-foreground">
    {mobileSidebarOpen && <div className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}
    <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarOpen ? 'w-[272px]' : 'w-[68px]'}`}>
      <NotesSidebar notes={notes} folders={folders} activeNoteId={activeNoteId} searchQuery={searchQuery} isCollapsed={!sidebarOpen} onSearchChange={setSearchQuery} onSelectNote={id => { setActiveNoteId(id); setActiveView('editor'); setMobileSidebarOpen(false); }} onCreateNote={createNote} onTogglePin={togglePin} onToggleFavorite={toggleFavorite} onDuplicate={duplicateNote} onDelete={id => setDeleteTarget(id)} onToggleCollapse={() => setSidebarOpen(v => !v)} onCreateFolder={() => setShowFolderModal(true)} onGoHome={() => { setActiveView('home'); setActiveNoteId(null); setMobileSidebarOpen(false); }} />
    </div>

    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <header className="hidden lg:flex h-[72px] shrink-0 items-center gap-5 border-b border-border bg-card/90 backdrop-blur-xl px-5 xl:px-7">
        <div className="flex items-center gap-3 min-w-[180px]"><AppLogo size={32}/><span className="font-bold tracking-tight">Smart<span className="text-primary">Notepad</span></span></div>
        <button onClick={() => setCommandOpen(true)} className="app-control h-10 flex-1 max-w-[620px] mx-auto px-3.5 flex items-center gap-3 text-sm text-muted-foreground text-left"><Search size={16}/><span className="flex-1">Search notes, commands, and ideas…</span><kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px]">Ctrl K</kbd></button>
        <div className="flex items-center gap-1.5 min-w-[180px] justify-end"><button onClick={() => setSearchPanelOpen(v => !v)} className="toolbar-btn" title="Web search"><Sparkles size={18}/></button><button onClick={toggleTheme} className="toolbar-btn" title="Toggle theme">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button><button onClick={() => router.push('/settings')} className="toolbar-btn" title="Settings"><Settings size={18}/></button><div className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary text-sm font-bold">K</div></div>
      </header>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card lg:hidden"><button onClick={() => setMobileSidebarOpen(true)} className="toolbar-btn"><Menu size={20}/></button><span className="text-sm font-semibold truncate max-w-[55%]">{activeView === 'editor' && activeNote ? activeNote.title : 'SmartNotepad'}</span><button onClick={() => setSearchPanelOpen(v => !v)} className="toolbar-btn"><PanelRight size={19}/></button></div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          {activeView === 'home' ? <DashboardHome notes={notes} folders={folders} onCreateNote={createNote} onSelectNote={id => { setActiveNoteId(id); setActiveView('editor'); }} onOpenSearch={() => setSearchPanelOpen(true)} /> : activeNote ? <NoteEditor note={activeNote} folders={folders} onUpdate={updateNote} onTogglePin={() => togglePin(activeNote.id)} onToggleFavorite={() => toggleFavorite(activeNote.id)} onDelete={() => setDeleteTarget(activeNote.id)} onDuplicate={() => duplicateNote(activeNote.id)} onToggleSearch={() => setSearchPanelOpen(v => !v)} searchPanelOpen={searchPanelOpen} insertContent={insertContent} onInsertConsumed={() => setInsertContent(null)} /> : <div className="h-full grid place-items-center text-sm text-muted-foreground">Select a note or create a new one</div>}
        </div>
        <div className={`fixed right-0 top-0 h-full lg:relative lg:top-auto lg:right-auto w-80 xl:w-96 bg-card border-l border-border transition-transform duration-300 z-30 overflow-hidden ${searchPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-full lg:w-0 lg:border-0'}`}>
          {searchPanelOpen && <div className="h-full flex flex-col"><div className="h-[72px] flex items-center justify-between px-5 border-b border-border"><div><p className="text-sm font-semibold">Web search</p><p className="text-[11px] text-muted-foreground">Research without leaving your notes</p></div><button onClick={() => setSearchPanelOpen(false)} className="toolbar-btn"><X size={17}/></button></div><WebSearchPanel onInsertIntoNote={handleInsertIntoNote} hasActiveNote={!!activeNoteId}/></div>}
        </div>
      </div>
    </div>

    {commandOpen && <div className="fixed inset-0 z-[80] bg-slate-950/30 backdrop-blur-sm p-4 sm:p-8" onClick={() => setCommandOpen(false)}><div className="mx-auto mt-[10vh] w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-center gap-3 border-b border-border px-4 py-4"><Command size={18} className="text-primary"/><input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search your notes or type a command…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/><kbd className="text-[10px] text-muted-foreground">ESC</kbd></div><div className="p-2">{[{label:'Create a new note',icon:Plus,action:createNote},{label:'Open dashboard',icon:LayoutDashboard,action:()=>{setActiveView('home');setCommandOpen(false)}},{label:'Open web search',icon:Sparkles,action:()=>{setSearchPanelOpen(true);setCommandOpen(false)}},{label:'Open settings',icon:Settings,action:()=>router.push('/settings')}].map(item => <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted"><span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-primary"><item.icon size={15}/></span><span className="text-sm font-medium">{item.label}</span><ChevronRightIcon/></button>)}</div><div className="border-t border-border px-4 py-3 text-[10px] text-muted-foreground">Tip: Ctrl + K opens this command center anytime.</div></div></div>}
    {showFolderModal && <FolderModal onClose={() => setShowFolderModal(false)} onCreate={createFolder}/>} {deleteTarget && <DeleteModal noteTitle={notes.find(n => n.id === deleteTarget)?.title ?? 'this note'} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteNote(deleteTarget)}/>} 
  </div>;
}

function ChevronRightIcon() { return <span className="ml-auto text-muted-foreground">›</span>; }
