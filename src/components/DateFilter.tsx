'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '3 months', days: 90 },
];

function toDateString(d: Date) {
  return d.toISOString().split('T')[0];
}

function getPresetRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  return { from: toDateString(from), to: toDateString(to) };
}

export function DateFilter({ from, to }: { from: string | null; to: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState({ from, to });

  function applyDates(nextFrom: string | null, nextTo: string | null) {
    setOptimistic({ from: nextFrom, to: nextTo });
    const params = new URLSearchParams(searchParams.toString());
    if (nextFrom) params.set('from', nextFrom); else params.delete('from');
    if (nextTo) params.set('to', nextTo); else params.delete('to');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function applyPreset(days: number) {
    const range = getPresetRange(days);
    applyDates(range.from, range.to);
  }

  const today = toDateString(new Date());
  const hasFilter = optimistic.from || optimistic.to;

  function isPresetActive(days: number) {
    const range = getPresetRange(days);
    return optimistic.from === range.from && optimistic.to === range.to;
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Date</span>

      <div className="flex gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            onClick={() => applyPreset(p.days)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isPresetActive(p.days)
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border border-transparent'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={optimistic.from ?? ''}
          max={optimistic.to ?? today}
          onChange={(e) => applyDates(e.target.value || null, optimistic.to)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-300 [color-scheme:dark] focus:border-blue-500 focus:outline-none"
        />
        <span className="text-zinc-600 text-sm">—</span>
        <input
          type="date"
          value={optimistic.to ?? ''}
          min={optimistic.from ?? undefined}
          max={today}
          onChange={(e) => applyDates(optimistic.from, e.target.value || null)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-300 [color-scheme:dark] focus:border-blue-500 focus:outline-none"
        />
      </div>

      {hasFilter && (
        <button
          onClick={() => applyDates(null, null)}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
