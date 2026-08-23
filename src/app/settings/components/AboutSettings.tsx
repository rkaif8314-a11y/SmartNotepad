'use client';

import { ShieldCheck, Cloud, Search, Sparkles, BookOpen, Heart } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

const FEATURES = [
  { icon: BookOpen, title: 'Quick Notes', text: 'Capture ideas, study notes, plans and important information without unnecessary complexity.' },
  { icon: Search, title: 'Search & Research', text: 'Find your notes quickly and research without losing the context of what you are writing.' },
  { icon: Cloud, title: 'Cloud Workspace', text: 'Keep your authenticated workspace available whenever you sign in.' },
  { icon: ShieldCheck, title: 'Privacy First', text: 'Your notes are associated with your own account so personal workspaces stay separated.' },
];

export default function AboutSettings() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="relative p-7 sm:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(124,58,237,.10),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,.08),transparent_35%)]" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
            <AppLogo size={96} />
            <div>
              <p className="text-sm font-semibold text-primary">About the app</p>
              <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">SmartNotepad</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                A modern, simple and secure digital workspace for capturing ideas, organizing information and keeping your important notes accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-7 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Sparkles size={18} /></div>
          <div>
            <h3 className="text-lg font-bold">Write smarter. Organize better. Remember everything.</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              SmartNotepad is built around a focused note-taking experience: less friction, clearer organization and a private workspace for the things worth remembering.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><Icon size={18} /></div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground"><Heart size={16} className="text-primary" /> Built for your ideas</div>
        <p className="mt-2 leading-6">SmartNotepad keeps the interface clean while giving you the tools to write, plan, research and stay organized.</p>
        <p className="mt-4 text-xs text-muted-foreground">SmartNotepad • Secure cloud notes</p>
      </section>
    </div>
  );
}
