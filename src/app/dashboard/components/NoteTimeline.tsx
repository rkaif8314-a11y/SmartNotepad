'use client';
import React from 'react';
import { Clock, CalendarDays } from 'lucide-react';

function format(value:string){return new Date(value).toLocaleString('en-GB',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});}

export default function NoteTimeline({createdAt,updatedAt}:{createdAt:string;updatedAt:string}){
 return <div className="rounded-xl border border-border bg-card p-3">
  <div className="flex items-center gap-2 mb-3"><CalendarDays size={14} className="text-primary"/><p className="text-xs font-semibold">Note timeline</p></div>
  <div className="space-y-3 text-xs">
   <div className="flex gap-2"><Clock size={13} className="mt-0.5 text-muted-foreground"/><div><p className="text-muted-foreground">Created</p><p className="font-medium mt-0.5">{format(createdAt)}</p></div></div>
   <div className="flex gap-2 border-t border-border pt-3"><Clock size={13} className="mt-0.5 text-muted-foreground"/><div><p className="text-muted-foreground">Last updated</p><p className="font-medium mt-0.5">{format(updatedAt)}</p></div></div>
  </div>
 </div>;
}