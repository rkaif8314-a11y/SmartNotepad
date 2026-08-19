'use client';

import React, { useState } from 'react';
import { X, Folder } from 'lucide-react';

const FOLDER_COLORS = [
  '#4f46e5', '#06b6d4', '#f59e0b', '#10b981',
  '#ef4444', '#8b5cf6', '#ec4899', '#64748b',
];

interface Props {
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

export default function FolderModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Folder name is required'); return; }
    if (name.trim().length > 30) { setError('Name must be 30 characters or fewer'); return; }
    onCreate(name.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 fade-in">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Folder size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">New Folder</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors duration-150">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="folder-name">
              Folder name
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Research, Work, Journal"
              autoFocus
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Folder color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {FOLDER_COLORS.map(c => (
                <button
                  key={`color-${c}`}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all duration-150 ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}