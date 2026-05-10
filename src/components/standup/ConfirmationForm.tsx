'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { confirmStandup } from '@/lib/actions/standup';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface Props {
  standupId: string;
  standupDate: string;
  items: string[];
}

export function ConfirmationForm({ standupId, standupDate, items }: Props) {
  const [states, setStates] = useState<Array<{ completed: boolean | null; note: string }>>(
    items.map(() => ({ completed: null, note: '' }))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (i: number, value: boolean) =>
    setStates((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, completed: value } : s))
    );

  const setNote = (i: number, note: string) =>
    setStates((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, note } : s))
    );

  function handleSubmit() {
    const unset = states.findIndex((s) => s.completed === null);
    if (unset !== -1) {
      setError(`Please mark item ${unset + 1} as completed or not`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await confirmStandup(
        standupId,
        states.map((s, i) => ({
          item_index: i,
          completed: s.completed!,
          note: s.note,
        }))
      );
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-blue-400">
        <ChevronRight className="h-4 w-4" />
        Yesterday ({formatDate(standupDate)}) you planned to:
      </div>

      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-zinc-300">{item}</p>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => toggle(i, true)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    states[i].completed === true
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-700 border border-zinc-600 text-zinc-400 hover:bg-green-950 hover:text-green-400 hover:border-green-700'
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => toggle(i, false)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    states[i].completed === false
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-700 border border-zinc-600 text-zinc-400 hover:bg-red-950 hover:text-red-400 hover:border-red-700'
                  )}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Not done
                </button>
              </div>
            </div>

            {states[i].completed === false && (
              <Input
                placeholder="What happened? (optional)"
                value={states[i].note}
                onChange={(e) => setNote(i, e.target.value)}
                className="text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} loading={isPending}>
        Save & continue
      </Button>
    </div>
  );
}
