'use client';

import React, { useState, useEffect, RefObject } from 'react';
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Link, Undo, Redo, Quote
} from 'lucide-react';

interface Props {
  editorRef: RefObject<HTMLDivElement | null>;
}

interface ToolbarItem {
  icon: React.ElementType;
  command: string;
  value?: string;
  title: string;
}

const TOOLS: ToolbarItem[] = [
  { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
  { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
  { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
];

const HEADINGS: ToolbarItem[] = [
  { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
  { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
  { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
];

const LISTS: ToolbarItem[] = [
  { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
  { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
  { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
];

export default function EditorToolbar({ editorRef }: Props) {
  const [activeCommands, setActiveCommands] = useState<Set<string>>(new Set());
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateActiveState();
  };

  const updateActiveState = () => {
    const active = new Set<string>();
    if (document.queryCommandState('bold')) active.add('bold');
    if (document.queryCommandState('italic')) active.add('italic');
    if (document.queryCommandState('underline')) active.add('underline');
    setActiveCommands(active);
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.addEventListener('keyup', updateActiveState);
    el.addEventListener('mouseup', updateActiveState);
    return () => {
      el.removeEventListener('keyup', updateActiveState);
      el.removeEventListener('mouseup', updateActiveState);
    };
  }, [editorRef]);

  const insertCodeBlock = () => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, 'pre');
    updateActiveState();
  };

  const insertLink = () => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    exec('createLink', url);
    setShowLinkInput(false);
    setLinkUrl('');
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 py-1.5 px-1 bg-muted/50 rounded-lg border border-border">
      {/* Undo / Redo */}
      <button onClick={() => exec('undo')} title="Undo (Ctrl+Z)" className="toolbar-btn">
        <Undo size={15} />
      </button>
      <button onClick={() => exec('redo')} title="Redo (Ctrl+Y)" className="toolbar-btn">
        <Redo size={15} />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Format */}
      {TOOLS.map(tool => (
        <button
          key={`toolbar-${tool.command}`}
          onClick={() => exec(tool.command, tool.value)}
          title={tool.title}
          className={`toolbar-btn ${activeCommands.has(tool.command) ? 'active' : ''}`}
        >
          <tool.icon size={15} />
        </button>
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      {/* Headings */}
      {HEADINGS.map(h => (
        <button
          key={`toolbar-${h.command}-${h.value}`}
          onClick={() => exec(h.command, h.value)}
          title={h.title}
          className="toolbar-btn"
        >
          <h.icon size={15} />
        </button>
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      {/* Lists */}
      {LISTS.map(l => (
        <button
          key={`toolbar-${l.command}-${l.value ?? ''}`}
          onClick={() => exec(l.command, l.value)}
          title={l.title}
          className="toolbar-btn"
        >
          <l.icon size={15} />
        </button>
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      {/* Code */}
      <button onClick={insertCodeBlock} title="Code block" className="toolbar-btn">
        <Code size={15} />
      </button>

      {/* Link */}
      <div className="relative">
        <button
          onClick={() => setShowLinkInput(v => !v)}
          title="Insert link"
          className={`toolbar-btn ${showLinkInput ? 'active' : ''}`}
        >
          <Link size={15} />
        </button>
        {showLinkInput && (
          <div className="absolute left-0 top-9 z-20 flex items-center gap-2 bg-card border border-border rounded-lg shadow-lg px-3 py-2 w-64 fade-in">
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setShowLinkInput(false); }}
              className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={insertLink}
              className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors duration-150"
            >
              Insert
            </button>
          </div>
        )}
      </div>
    </div>
  );
}