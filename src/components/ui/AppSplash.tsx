'use client';

import { useEffect, useState } from 'react';
import AppLogo from './AppLogo';

const SPLASH_SEEN_KEY = 'smartnotepad_splash_seen_v1';

export default function AppSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SPLASH_SEEN_KEY) === '1') {
        setVisible(false);
        return;
      }
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      // Keep the splash usable even when storage is unavailable.
    }

    const timer = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-white text-slate-900 transition-opacity duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,.14),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(124,58,237,.13),transparent_30%),linear-gradient(135deg,#fff 0%,#f8fbff 55%,#faf7ff 100%)]" />
      <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full border-[24px] border-blue-100/80" />
      <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full border-[18px] border-violet-100/80" />
      <div className="absolute bottom-[-150px] left-[-5%] h-72 w-[110%] rotate-[-4deg] rounded-[50%] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-95" />
      <div className="absolute bottom-[-180px] left-[-8%] h-72 w-[116%] rotate-[3deg] rounded-[50%] bg-white/45" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 text-center">
        <div className="mb-7 animate-[pulse_1.8s_ease-in-out_infinite] rounded-[34px] shadow-[0_20px_60px_rgba(79,70,229,.18)]">
          <AppLogo size={132} />
        </div>
        <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
          Smart<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Notepad</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
          Write Smarter. Organize Better. Remember Everything.
        </p>
        <div className="mt-9 h-1.5 w-56 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-2/3 animate-[splash-progress_900ms_ease-out_forwards] rounded-full bg-gradient-to-r from-cyan-400 via-blue-600 to-violet-600" />
        </div>
        <p className="mt-3 text-xs font-medium tracking-wide text-slate-400">Loading your workspace…</p>
      </div>

      <style jsx>{`
        @keyframes splash-progress { from { transform: translateX(-110%); } to { transform: translateX(50%); } }
      `}</style>
    </div>
  );
}
