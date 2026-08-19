'use client';

import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface Props {
  noteTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ noteTitle, onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 fade-in">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 slide-up">
        <div className="flex items-centerjustify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="text-sm font-semibold text-foreground">Delete Note</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors duration-150">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground mb-1">
            Are you sure you want to delete
          </p>
          <p className="text-sm font-semibold text-foreground mb-4 truncate">&quot;{noteTitle}&quot;</p>
          <p className="text-xs text-muted-foreground mb-5">This action cannot be undone. The note will be permanently removed.</p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Delete Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}