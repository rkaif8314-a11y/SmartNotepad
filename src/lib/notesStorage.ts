// Backend integration point: replace localStorage with Supabase/DB calls

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
}

const NOTES_KEY = 'smartnotepad_notes';
const FOLDERS_KEY = 'smartnotepad_folders';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'folder-work', name: 'Work', color: '#4f46e5', createdAt: '2026-07-01T09:00:00Z' },
  { id: 'folder-personal', name: 'Personal', color: '#06b6d4', createdAt: '2026-07-01T09:00:00Z' },
  { id: 'folder-research', name: 'Research', color: '#f59e0b', createdAt: '2026-07-15T10:00:00Z' },
];

export const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-001',
    title: 'Q3 Product Roadmap Notes',
    content: '<h2>Q3 Priorities</h2><p>Focus areas for this quarter:</p><ul><li>Onboarding flow improvements</li><li>Mobile responsiveness pass</li><li>API rate limiting</li></ul><p>Key deadline: <strong>September 30, 2026</strong></p>',
    folderId: 'folder-work',
    isPinned: true,
    isFavorite: false,
    createdAt: '2026-08-01T08:30:00Z',
    updatedAt: '2026-08-17T14:22:00Z',
    wordCount: 38,
  },
  {
    id: 'note-002',
    title: 'Machine Learning Study Notes',
    content: '<h2>Gradient Descent</h2><p>An optimization algorithm that minimizes the loss function by iteratively moving in the direction of steepest descent.</p><pre>θ = θ - α * ∇J(θ)</pre><p>Where α is the learning rate.</p>',
    folderId: 'folder-research',
    isPinned: false,
    isFavorite: true,
    createdAt: '2026-08-05T11:00:00Z',
    updatedAt: '2026-08-16T09:45:00Z',
    wordCount: 52,
  },
  {
    id: 'note-003',
    title: 'Weekend Trip Ideas — Coorg',
    content: '<p>Planning a trip to Coorg in September.</p><ul><li>Abbey Falls</li><li>Raja\'s Seat viewpoint</li><li>Coffee estate tour</li></ul><p>Budget: ₹8,000 per person for 3 days.</p>',
    folderId: 'folder-personal',
    isPinned: false,
    isFavorite: true,
    createdAt: '2026-08-10T17:30:00Z',
    updatedAt: '2026-08-15T20:10:00Z',
    wordCount: 41,
  },
  {
    id: 'note-004',
    title: 'API Design Best Practices',
    content: '<h3>RESTful API Guidelines</h3><p>Use nouns, not verbs in endpoints. Version your API from day one.</p><ul><li>GET /api/v1/notes</li><li>POST /api/v1/notes</li><li>PATCH /api/v1/notes/:id</li></ul>',
    folderId: 'folder-work',
    isPinned: false,
    isFavorite: false,
    createdAt: '2026-08-12T10:00:00Z',
    updatedAt: '2026-08-14T11:30:00Z',
    wordCount: 44,
  },
  {
    id: 'note-005',
    title: 'Book List — August 2026',
    content: '<p>Books to read this month:</p><ol><li><strong>Atomic Habits</strong> — James Clear</li><li><strong>Deep Work</strong> — Cal Newport</li><li><strong>The Psychology of Money</strong> — Morgan Housel</li></ol>',
    folderId: 'folder-personal',
    isPinned: false,
    isFavorite: false,
    createdAt: '2026-08-13T08:00:00Z',
    updatedAt: '2026-08-13T08:00:00Z',
    wordCount: 29,
  },
  {
    id: 'note-006',
    title: 'TypeScript Utility Types Cheatsheet',
    content: '<h3>Common Utility Types</h3><pre>Partial&lt;T&gt; — all props optional\nRequired&lt;T&gt; — all props required\nPick&lt;T, K&gt; — pick subset of props\nOmit&lt;T, K&gt; — omit subset of props\nRecord&lt;K, V&gt; — map keys to type</pre>',
    folderId: 'folder-research',
    isPinned: true,
    isFavorite: true,
    createdAt: '2026-08-14T14:00:00Z',
    updatedAt: '2026-08-18T10:05:00Z',
    wordCount: 35,
  },
  {
    id: 'note-007',
    title: 'Meeting Notes — Design Review',
    content: '<p>Attendees: Maya, Arjun, Priya, Dev</p><p><strong>Action items:</strong></p><ul><li>Update color tokens in Figma — Maya</li><li>Export updated icons — Dev</li><li>Send spec doc to engineering — Arjun</li></ul>',
    folderId: 'folder-work',
    isPinned: false,
    isFavorite: false,
    createdAt: '2026-08-18T15:00:00Z',
    updatedAt: '2026-08-18T16:30:00Z',
    wordCount: 33,
  },
  {
    id: 'note-008',
    title: 'Quick Ideas Dump',
    content: '<p>Random ideas to explore:</p><ul><li>Browser extension for SmartNotepad</li><li>Offline mode with IndexedDB</li><li>Collaborative editing</li><li>AI summarization of notes</li></ul>',
    folderId: null,
    isPinned: false,
    isFavorite: false,
    createdAt: '2026-08-18T22:00:00Z',
    updatedAt: '2026-08-18T22:00:00Z',
    wordCount: 27,
  },
];

export function loadNotes(): Note[] {
  if (typeof window === 'undefined') return DEFAULT_NOTES;
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return DEFAULT_NOTES;
    return JSON.parse(raw) as Note[];
  } catch {
    return DEFAULT_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function loadFolders(): Folder[] {
  if (typeof window === 'undefined') return DEFAULT_FOLDERS;
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return DEFAULT_FOLDERS;
    return JSON.parse(raw) as Folder[];
  } catch {
    return DEFAULT_FOLDERS;
  }
}

export function saveFolders(folders: Folder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(w => w.length > 0).length;
}

export function formatRelativeTime(iso: string): string {
  const now = new Date('2026-08-18T22:41:28Z');
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}