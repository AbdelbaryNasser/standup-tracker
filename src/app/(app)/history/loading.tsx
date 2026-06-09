export default function HistoryLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-zinc-800" />
        <div className="h-4 w-56 rounded bg-zinc-800/60" />
      </div>

      {/* Filter bars */}
      <div className="flex gap-2">
        {[80, 96, 72, 88].map((w, i) => (
          <div key={i} className="h-8 rounded-lg bg-zinc-800" style={{ width: w }} />
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <div className="h-3 w-10 rounded bg-zinc-800" />
        {[60, 72, 88].map((w, i) => (
          <div key={i} className="h-8 rounded-lg bg-zinc-800" style={{ width: w }} />
        ))}
        <div className="h-8 w-28 rounded-lg bg-zinc-800" />
        <div className="h-4 w-4 rounded bg-zinc-800" />
        <div className="h-8 w-28 rounded-lg bg-zinc-800" />
      </div>

      {/* Date group + cards */}
      {[1, 2].map((g) => (
        <div key={g} className="space-y-3">
          <div className="h-3 w-24 rounded bg-zinc-800" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].slice(0, g === 1 ? 3 : 2).map((i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-zinc-800" />
                  <div className="h-4 w-28 rounded bg-zinc-800" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded bg-zinc-800" />
                  <div className="h-3 w-4/5 rounded bg-zinc-800" />
                  <div className="h-3 w-3/5 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
