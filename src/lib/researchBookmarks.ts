'use client';
import { supabase } from '@/lib/supabase/client';
export type ResearchBookmark={id:string;title:string;url:string;note?:string|null;createdAt:string;};
export async function listResearchBookmarks(){const {data,error}=await supabase.from('research_bookmarks').select('*').order('created_at',{ascending:false});if(error)throw error;return (data??[]).map((b:any)=>({id:b.id,title:b.title,url:b.url,note:b.note,createdAt:b.created_at})) as ResearchBookmark[];}
export async function saveResearchBookmark(title:string,url:string,note?:string){const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Please sign in first.');const normalized=/^https?:\/\//i.test(url.trim())?url.trim():`https://${url.trim()}`;const {data,error}=await supabase.from('research_bookmarks').upsert({user_id:user.id,title:title.trim()||normalized,url:normalized,note:note?.trim()||null},{onConflict:'user_id,url'}).select().single();if(error)throw error;return data;}
export async function deleteResearchBookmark(id:string){const {error}=await supabase.from('research_bookmarks').delete().eq('id',id);if(error)throw error;}
