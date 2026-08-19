'use client';
import { supabase } from '@/lib/supabase/client';
export type AIGeneration={id:string;noteId:string|null;action:string;inputText:string;outputText:string;model:string|null;createdAt:string};
export async function saveAIGeneration(input:{noteId?:string|null;action:string;inputText:string;outputText:string;model?:string|null}){const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Please sign in first.');const {data,error}=await supabase.from('ai_generations').insert({user_id:user.id,note_id:input.noteId??null,action:input.action,input_text:input.inputText,output_text:input.outputText,model:input.model??null}).select().single();if(error)throw error;return data as AIGeneration;}
export async function listAIGenerations(noteId?:string){let q=supabase.from('ai_generations').select('*').order('created_at',{ascending:false});if(noteId)q=q.eq('note_id',noteId);const {data,error}=await q; if(error)throw error;return (data??[]) as AIGeneration[];}
