'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Pin, PinOff, Star, StarOff, Trash2, Copy,
  PanelRight, Folder, Check, Loader2
} from 'lucide-react';
import { type Note, type Folder as FolderType } from '@/lib/notesStorage';
import EditorToolbar from './EditorToolbar';

interface Props {
  note: Note;
  folders: FolderType[];
  onUpdate: (id: string, changes: Partial<Note>) => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleSearch: () => void;
  searchPanelOpen: boolean;
  insertContent: string | null;
  onInsertConsumed: () => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

export default function NoteEditor({
  note, folders, onUpdate, onTogglePin, onToggleFavorite,
  onDelete, onDuplicate, onToggleSearch, searchPanelOpen,
  insertContent, onInsertConsumed,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [charCount, setCharCount] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);

  // Sync editor content when note changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== note.content) {
      editorRef.current.innerHTML = note.content;
      updateCounts();
    }
    if (titleRef.current && titleRef.current.value !== note.title) {
      titleRef.current.value = note.title;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  // Insert content from web search
  useEffect(() => {
    if (!insertContent || !editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const div = document.createElement('div');
      div.innerHTML = insertContent;
      range.insertNode(div);
      range.collapse(false);
    } else {
      editorRef.current.innerHTML += insertContent;
    }
    triggerSave(editorRef.current.innerHTML);
    onInsertConsumed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertContent]);

  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    setCharCount(text.length);
  };

  const triggerSave = useCallback((content: string) => {
    setSaveState('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onUpdate(note.id, { content });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 600);
  }, [note.id, onUpdate]);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    updateCounts();
    triggerSave(editorRef.current.innerHTML);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveState('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onUpdate(note.id, { title: e.target.value });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key === 's') { e.preventDefault(); }
    if (ctrl && e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
    if (ctrl && e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
    if (ctrl && e.key === 'u') { e.preventDefault(); document.execCommand('underline'); }
  };

  const currentFolder = folders.find(f => f.id === note.folderId);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Folder badge */}
          <div className="relative">
            <button
              onClick={() => setFolderMenuOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-border px-2 py-1 rounded-md transition-colors duration-150"
            >
              <Folder size={12} style={{ color: currentFolder?.color ?? 'currentColor' }} />
              <span>{currentFolder?.name ?? 'No folder'}</span>
            </button>
            {folderMenuOpen && (
              <div className="absolute left-0 top-8 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-44 fade-in">
                <button
                  onClick={() => { onUpdate(note.id, { folderId: null }); setFolderMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors duration-150"
                >
                  No folder
                </button>
                {folders.map(f => (
                  <button
                    key={`assign-folder-${f.id}`}
                    onClick={() => { onUpdate(note.id, { folderId: f.id }); setFolderMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors duration-150"
                  >
                    <Folder size={12} style={{ color: f.color }} />
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Save indicator */}
          <div className="flex items-center gap-1 mr-2">
            {saveState === 'saving' && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 size={11} className="animate-spin" />
                Saving…
              </span>
            )}
            {saveState === 'saved' && (
              <span className="flex items-center gap-1 text-[11px] text-green-500">
                <Check size={11} />
                Saved
              </span>
            )}
          </div>

          {[
            { icon: note.isPinned ? PinOff : Pin, action: onTogglePin, title: note.isPinned ? 'Unpin note' : 'Pin note', active: note.isPinned },
            { icon: note.isFavorite ? StarOff : Star, action: onToggleFavorite, title: note.isFavorite ? 'Remove from favorites' : 'Add to favorites', active: note.isFavorite },
            { icon: Copy, action: onDuplicate, title: 'Duplicate note', active: false },
            { icon: Trash2, action: onDelete, title: 'Delete note — this cannot be undone', active: false, danger: true },
            { icon: PanelRight, action: onToggleSearch, title: 'Toggle web search (Ctrl+Shift+F)', active: searchPanelOpen },
          ].map(btn => (
            <button
              key={`editor-action-${btn.title}`}
              onClick={btn.action}
              title={btn.title}
              className={`toolbar-btn ${btn.active ? 'active' : ''} ${btn.danger ? 'hover:bg-red-50 hover:text-red-500' : ''}`}
            >
              <btn.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="px-4 lg:px-10 pt-6 pb-2 shrink-0">
        <input
          ref={titleRef}
          type="text"
          defaultValue={note.title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="w-full text-2xl font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Last edited {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}
          <span className="font-mono-data">{note.wordCount}</span> words
          {' · '}
          <span className="font-mono-data">{charCount}</span> chars
        </p>
      </div>

      {/* Toolbar */}
      <div className="px-4 lg:px-10 pb-2 shrink-0">
        <EditorToolbar editorRef={editorRef} />
      </div>

      <div className="w-full h-px bg-border mx-auto shrink-0" />

      {/* Editor */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 lg:px-10 py-4">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          onKeyDown={handleKeyDown}
          data-placeholder="Start writing your note…"
          className="editor-content focus:outline-none min-h-[400px] relative
            before:content-[attr(data-placeholder)] before:absolute before:top-0 before:left-0
            before:text-muted-foreground/40 before:pointer-events-none before:text-base
            [&:not(:empty)]:before:hidden"
        />
      </div>
    </div>
  );
}