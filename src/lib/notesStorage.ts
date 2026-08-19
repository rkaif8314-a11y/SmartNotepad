'use client';

import { ensureSupabaseUser, supabase } from './supabase';

export interface Folder { id: string; name: string; color: string; createdAt: string; }
export interface Note { id: string; title: string; content: string; folderId: string | null; isPinned: boolean; isFavorite: boolean; createdAt: string; updatedAt: string; wordCount: number; isArchived?: boolean; deletedAt?: string | null; color?: string | null; tags?: string[]; }
export interface NoteRevision { id: string; noteId: string; title: string; content: string; createdAt: string; }
export interface Backlink { sourceNoteId: string; title: string; updatedAt: string; }

const NOTES_KEY = 'smartnotepad_notes';
const FOLDERS_KEY = 'smartnotepad_folders';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'folder-work', name: 'Work', color: '#4f46e5', createdAt: '2026-07-01T09:00:00Z' },
  { id: 'folder-personal', name: 'Personal', color: '#06b6d4', createdAt: '2026-07-01T09:00:00Z' },
  { id: 'folder-research', name: 'Research', color: '#f59e0b', createdAt: '2026-07-15T10:00:00Z' },
];

export const DEFAULT_NOTES: Note[] = [
  { id: 'note-001', title: 'Q3 Product Roadmap Notes', content: '<h2>Q3 Priorities</h2><p>Focus areas for this quarter:</p><ul><li>Onboarding flow improvements</li><li>Mobile responsiveness pass</li><li>API rate limiting</li></ul><p>Key deadline: <strong>September 30, 2026</strong></p>', folderId: 'folder-work', isPinned: true, isFavorite: false, createdAt: '2026-08-01T08:30:00Z', updatedAt: '2026-08-17T14:22:00Z', wordCount: 38, tags: ['roadmap'] },
  { id: 'note-002', title: 'Machine Learning Study Notes', content: '<h2>Gradient Descent</h2><p>An optimization algorithm that minimizes the loss function by iteratively moving in the direction of steepest descent.</p><pre>θ = θ - α * ∇J(θ)</pre><p>Where α is the learning rate.</p>', folderId: 'folder-research', isPinned: false, isFavorite: true, createdAt: '2026-08-05T11:00:00Z', updatedAt: '2026-08-16T09:45:00Z', wordCount: 52, tags: ['study'] },
];

export function loadNotes(): Note[] { if (typeof window === 'undefined') return DEFAULT_NOTES; try { const raw = localStorage.getItem(NOTES_KEY); return raw ? JSON.parse(raw) as Note[] : DEFAULT_NOTES; } catch { return DEFAULT_NOTES; } }
export function saveNotes(notes: Note[]): void { if (typeof window === 'undefined') return; localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); void syncNotesToCloud(notes); }
export function loadFolders(): Folder[] { if (typeof window === 'undefined') return DEFAULT_FOLDERS; try { const raw = localStorage.getItem(FOLDERS_KEY); return raw ? JSON.parse(raw) as Folder[] : DEFAULT_FOLDERS; } catch { return DEFAULT_FOLDERS; } }
export function saveFolders(folders: Folder[]): void { if (typeof window === 'undefined') return; localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)); void syncFoldersToCloud(folders); }

async function syncNotesToCloud(notes: Note[]) {
  if (!supabase) return; const user = await ensureSupabaseUser(); if (!user) return;
  const rows = notes.map(note => ({ id: note.id, user_id: user.id, title: note.title, content: note.content, folder_id: note.folderId, is_pinned: note.isPinned, is_favorite: note.isFavorite, created_at: note.createdAt, updated_at: note.updatedAt, word_count: note.wordCount, is_archived: Boolean(note.isArchived), deleted_at: note.deletedAt ?? null, color: note.color ?? null, tags: note.tags ?? [] }));
  const { data: cloudRows, error: loadError } = await supabase.from('notes').select('id');
  if (loadError) { console.warn('SmartNotepad cloud note read failed:', loadError.message); return; }
  const wanted = new Set(notes.map(n => n.id)); const staleIds = (cloudRows ?? []).map(row => row.id).filter(id => !wanted.has(id));
  if (staleIds.length) await supabase.from('notes').delete().in('id', staleIds).eq('user_id', user.id);
  if (!rows.length) return;
  const { error } = await supabase.from('notes').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('SmartNotepad note sync failed:', error.message);
}

async function syncFoldersToCloud(folders: Folder[]) {
  if (!supabase) return; const user = await ensureSupabaseUser(); if (!user) return;
  const rows = folders.map(folder => ({ id: folder.id, user_id: user.id, name: folder.name, color: folder.color, created_at: folder.createdAt }));
  const { data: cloudRows, error: loadError } = await supabase.from('folders').select('id');
  if (loadError) { console.warn('SmartNotepad cloud folder read failed:', loadError.message); return; }
  const wanted = new Set(folders.map(f => f.id)); const staleIds = (cloudRows ?? []).map(row => row.id).filter(id => !wanted.has(id));
  if (staleIds.length) await supabase.from('folders').delete().in('id', staleIds).eq('user_id', user.id);
  if (!rows.length) return;
  const { error } = await supabase.from('folders').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('SmartNotepad folder sync failed:', error.message);
}

export async function hydrateFromCloud(): Promise<{ notes: Note[]; folders: Folder[] } | null> {
  if (!supabase) return null; const user = await ensureSupabaseUser(); if (!user) return null;
  const [{ data: cloudNotes, error: notesError }, { data: cloudFolders, error: foldersError }] = await Promise.all([
    supabase.from('notes').select('*').order('updated_at', { ascending: false }),
    supabase.from('folders').select('*').order('created_at', { ascending: true }),
  ]);
  if (notesError || foldersError) { console.warn('SmartNotepad cloud load failed:', notesError?.message || foldersError?.message); return null; }
  const localNotes = loadNotes(); const localFolders = loadFolders();
  const cloudMapped: Note[] = (cloudNotes ?? []).map(n => ({ id:n.id, title:n.title, content:n.content, folderId:n.folder_id, isPinned:n.is_pinned, isFavorite:n.is_favorite, createdAt:n.created_at, updatedAt:n.updated_at, wordCount:n.word_count, isArchived:n.is_archived, deletedAt:n.deleted_at, color:n.color, tags:n.tags ?? [] }));
  const cloudFoldersMapped: Folder[] = (cloudFolders ?? []).map(f => ({ id:f.id, name:f.name, color:f.color, createdAt:f.created_at }));
  const noteMap = new Map<string, Note>(); [...cloudMapped, ...localNotes].forEach(note => { const existing = noteMap.get(note.id); if (!existing || new Date(note.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) noteMap.set(note.id, note); });
  const folderMap = new Map<string, Folder>(); [...cloudFoldersMapped, ...localFolders].forEach(folder => { if (!folderMap.has(folder.id)) folderMap.set(folder.id, folder); });
  const finalNotes = [...noteMap.values()].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); const finalFolders = [...folderMap.values()];
  localStorage.setItem(NOTES_KEY, JSON.stringify(finalNotes)); localStorage.setItem(FOLDERS_KEY, JSON.stringify(finalFolders));
  void syncNotesToCloud(finalNotes); void syncFoldersToCloud(finalFolders);
  return { notes: finalNotes, folders: finalFolders };
}

export async function searchNotesCloud(query: string, limit = 50): Promise<Note[]> {
  if (!supabase || !query.trim()) return [];
  const { data, error } = await supabase.rpc('search_notes', { search_query: query.trim(), limit_count: limit, offset_count: 0 });
  if (error) { console.warn('SmartNotepad cloud search failed:', error.message); return []; }
  return (data ?? []).map((n: any) => ({ id:n.id, title:n.title, content:n.content, folderId:n.folder_id, isPinned:n.is_pinned, isFavorite:n.is_favorite, createdAt:n.updated_at, updatedAt:n.updated_at, wordCount:n.word_count, isArchived:false, deletedAt:null }));
}

export async function getNoteRevisions(noteId: string): Promise<NoteRevision[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('note_revisions').select('id,note_id,title,content,created_at').eq('note_id', noteId).order('created_at', { ascending:false });
  if (error) { console.warn('SmartNotepad revision load failed:', error.message); return []; }
  return (data ?? []).map(r => ({ id:r.id, noteId:r.note_id, title:r.title, content:r.content, createdAt:r.created_at }));
}

export async function getNoteBacklinks(noteId: string): Promise<Backlink[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_note_backlinks', { note_id_input: noteId });
  if (error) { console.warn('SmartNotepad backlinks load failed:', error.message); return []; }
  return (data ?? []).map((r:any) => ({ sourceNoteId:r.source_note_id, title:r.title, updatedAt:r.updated_at }));
}

export async function setNoteLinks(sourceNoteId: string, targetNoteIds: string[]): Promise<void> {
  if (!supabase) return; const user = await ensureSupabaseUser(); if (!user) return;
  await supabase.from('note_links').delete().eq('source_note_id', sourceNoteId).eq('user_id', user.id);
  const unique = [...new Set(targetNoteIds)].filter(id => id && id !== sourceNoteId);
  if (unique.length) await supabase.from('note_links').insert(unique.map(target_note_id => ({ source_note_id:sourceNoteId, target_note_id, user_id:user.id })));
}

export async function moveNoteToTrash(noteId: string): Promise<void> {
  if (!supabase) return; const user = await ensureSupabaseUser(); if (!user) return;
  await supabase.from('notes').update({ deleted_at:new Date().toISOString() }).eq('id', noteId).eq('user_id', user.id);
}

export async function restoreNoteFromTrash(noteId: string): Promise<void> {
  if (!supabase) return; const user = await ensureSupabaseUser(); if (!user) return;
  await supabase.from('notes').update({ deleted_at:null, is_archived:false }).eq('id', noteId).eq('user_id', user.id);
}

export function countWords(html: string): number { const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); return text ? text.split(' ').filter(Boolean).length : 0; }
export function formatRelativeTime(iso: string): string { const diffMs = Date.now() - new Date(iso).getTime(); const diffMin = Math.floor(diffMs / 60000); if (diffMin < 1) return 'just now'; if (diffMin < 60) return `${diffMin}m ago`; const diffHr = Math.floor(diffMin / 60); if (diffHr < 24) return `${diffHr}h ago`; const diffDay = Math.floor(diffHr / 24); if (diffDay < 7) return `${diffDay}d ago`; return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
