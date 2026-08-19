import React from 'react';
import { Keyboard } from 'lucide-react';

const SHORTCUT_GROUPS = [
  {
    group: 'Notes',
    shortcuts: [
      { keys: ['Ctrl', 'N'], description: 'Create a new note' },
      { keys: ['Ctrl', 'S'], description: 'Save current note' },
      { keys: ['Ctrl', 'F'], description: 'Search notes in sidebar' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate current note' },
    ],
  },
  {
    group: 'Editor Formatting',
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Bold selected text' },
      { keys: ['Ctrl', 'I'], description: 'Italic selected text' },
      { keys: ['Ctrl', 'U'], description: 'Underline selected text' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last change' },
      { keys: ['Ctrl', 'Y'], description: 'Redo last undone change' },
    ],
  },
  {
    group: 'Web Search',
    shortcuts: [
      { keys: ['Ctrl', 'Shift', 'F'], description: 'Open web search panel' },
      { keys: ['Enter'], description: 'Execute search query' },
      { keys: ['Escape'], description: 'Close search panel' },
    ],
  },
  {
    group: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', '\\'], description: 'Toggle sidebar collapse' },
      { keys: ['Ctrl', ','], description: 'Open settings' },
    ],
  },
];

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 bg-muted border border-border rounded text-[11px] font-mono-data font-medium text-foreground shadow-sm">
      {label}
    </kbd>
  );
}

export default function ShortcutsSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-secondary/50 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Keyboard size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          These shortcuts work across the SmartNotepad editor. On macOS, use <KeyBadge label="⌘" /> instead of <KeyBadge label="Ctrl" />.
        </p>
      </div>

      {SHORTCUT_GROUPS.map(group => (
        <div key={`shortcut-group-${group.group}`} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-muted/50 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{group.group}</h3>
          </div>
          <div className="divide-y divide-border">
            {group.shortcuts.map(sc => (
              <div
                key={`shortcut-${group.group}-${sc.description}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors duration-150"
              >
                <span className="text-sm text-foreground">{sc.description}</span>
                <div className="flex items-center gap-1">
                  {sc.keys.map((key, ki) => (
                    <React.Fragment key={`key-${group.group}-${sc.description}-${ki}`}>
                      <KeyBadge label={key} />
                      {ki < sc.keys.length - 1 && (
                        <span className="text-[10px] text-muted-foreground mx-0.5">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}