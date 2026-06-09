'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { submitStandup } from '@/lib/actions/standup';
import { Plus, X, Send, AlertTriangle } from 'lucide-react';

export function StandupForm({ defaultYesterday }: { defaultYesterday?: string[] }) {
  const [yesterdayItems, setYesterdayItems] = useState<string[]>(
    defaultYesterday && defaultYesterday.length > 0 ? defaultYesterday : ['']
  );
  const [todayItems, setTodayItems] = useState(['']);
  const [hasBlocker, setHasBlocker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const addYesterdayItem = () => setYesterdayItems((prev) => [...prev, '']);
  const removeYesterdayItem = (i: number) => setYesterdayItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateYesterdayItem = (i: number, value: string) =>
    setYesterdayItems((prev) => prev.map((item, idx) => (idx === i ? value : item)));

  const addItem = () => setTodayItems((prev) => [...prev, '']);
  const removeItem = (i: number) => setTodayItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, value: string) =>
    setTodayItems((prev) => prev.map((item, idx) => (idx === i ? value : item)));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitStandup(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          What did you work on yesterday?
        </label>
        <div className="space-y-2">
          {yesterdayItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400 border border-zinc-700">
                {i + 1}
              </span>
              <Input
                name={`yesterday_item_${i}`}
                value={item}
                onChange={(e) => updateYesterdayItem(i, e.target.value)}
                placeholder={`Task ${i + 1}`}
                required={i === 0}
              />
              {yesterdayItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeYesterdayItem(i)}
                  className="shrink-0 rounded-md p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addYesterdayItem}
          className="mt-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          What are you planning today?
        </label>
        <div className="space-y-2">
          {todayItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-medium text-blue-400 border border-blue-800">
                {i + 1}
              </span>
              <Input
                name={`today_item_${i}`}
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`Task ${i + 1}`}
              />
              {todayItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="shrink-0 rounded-md p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addItem}
          className="mt-1 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setHasBlocker((v) => !v)}
          className={`flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
            hasBlocker
              ? 'border-orange-700/60 bg-orange-950/40 text-orange-300'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
          }`}
        >
          <AlertTriangle className={`h-4 w-4 shrink-0 ${hasBlocker ? 'text-orange-400' : 'text-zinc-600'}`} />
          <span className="flex-1 text-left">I have a blocker</span>
          {/* Toggle pill */}
          <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${hasBlocker ? 'bg-orange-500' : 'bg-zinc-700'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${hasBlocker ? 'translate-x-4' : 'translate-x-0'}`} />
          </span>
        </button>

        {hasBlocker && (
          <Textarea
            name="blockers"
            placeholder="Describe your blocker..."
            className="min-h-[80px]"
            autoFocus
            required
          />
        )}

        {/* Hidden field so the server action always receives the key */}
        {!hasBlocker && <input type="hidden" name="blockers" value="" />}
      </div>

      <Button type="submit" loading={isPending} size="lg" className="w-full sm:w-auto">
        <Send className="h-4 w-4" />
        Submit standup
      </Button>
    </form>
  );
}
