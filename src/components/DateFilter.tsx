'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '3 months', days: 90 },
];

function toDateString(d: Date) {
  return d.toISOString().split('T')[0];
}

export function DateFilter({ from, to }: { from: string | null; to: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function applyDates(nextFrom: string | null, nextTo: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextFrom) params.set('from', nextFrom); else params.delete('from');
    if (nextTo) params.set('to', nextTo); else params.delete('to');
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPreset(days: number) {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days + 1);
    applyDates(toDateString(fromDate), toDateString(toDate));
  }

  function clearDates() {
    applyDates(null, null);
  }

  const today = toDateString(new Date());
  const hasFilter = from || to;

  // Check if a preset is currently active
  function isPresetActive(days: number) {
    const expectedTo = toDateString(new Date());
    const expectedFrom = toDateString(new Date(new Date().setDate(new Date().getDate() - days + 1)));
    return from === expectedFrom && to === expectedTo;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Date</span>

      {/* Presets */}
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

      {/* Custom range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from ?? ''}
          max={to ?? today}
          onChange={(e) => applyDates(e.target.value || null, to)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-300 [color-scheme:dark] focus:border-blue-500 focus:outline-none"
        />
        <span className="text-zinc-600 text-sm">—</span>
        <input
          type="date"
          value={to ?? ''}
          min={from ?? undefined}
          max={today}
          onChange={(e) => applyDates(from, e.target.value || null)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-300 [color-scheme:dark] focus:border-blue-500 focus:outline-none"
        />
      </div>

      {hasFilter && (
        <button
          onClick={clearDates}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
