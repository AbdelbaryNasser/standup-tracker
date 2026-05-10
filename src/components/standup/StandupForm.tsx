'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { submitStandup } from '@/lib/actions/standup';
import { Plus, X, Send } from 'lucide-react';

export function StandupForm() {
  const [todayItems, setTodayItems] = useState(['']);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        <Textarea
          name="yesterday"
          placeholder="Describe what you accomplished..."
          className="min-h-[100px]"
          required
        />
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          Any blockers?{' '}
          <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <Textarea
          name="blockers"
          placeholder="Describe any blockers or impediments..."
        />
      </div>

      <Button type="submit" loading={isPending} size="lg" className="w-full sm:w-auto">
        <Send className="h-4 w-4" />
        Submit standup
      </Button>
    </form>
  );
}
