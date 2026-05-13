'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { updateStandup } from '@/lib/actions/standup';
import type { Standup, StandupConfirmation } from '@/lib/types';
import { CheckCircle2, XCircle, Circle, Pencil, X, Save, Plus } from 'lucide-react';

interface Props {
  standup: Standup;
  confirmations: StandupConfirmation[];
}

export function EditableStandupBody({ standup, confirmations }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEditing() {
    setEditItems([...standup.today_items]);
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditItems([]);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateStandup(standup.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
      }
    });
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-950/50 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Yesterday
          </label>
          <Textarea
            name="yesterday"
            defaultValue={standup.yesterday}
            required
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Today
          </label>
          <div className="space-y-2">
            {editItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-medium text-blue-400 border border-blue-800">
                  {i + 1}
                </span>
                <Input
                  name={`today_item_${i}`}
                  value={item}
                  onChange={(e) =>
                    setEditItems((prev) =>
                      prev.map((t, idx) => (idx === i ? e.target.value : t))
                    )
                  }
                  placeholder={`Task ${i + 1}`}
                />
                {editItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditItems((prev) => prev.filter((_, idx) => idx !== i))
                    }
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
            onClick={() => setEditItems((prev) => [...prev, ''])}
            className="mt-1 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
          >
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Blockers{' '}
            <span className="font-normal text-zinc-600">(optional)</span>
          </label>
          <Textarea name="blockers" defaultValue={standup.blockers ?? ''} />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" loading={isPending} size="sm">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={cancelEditing}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Yesterday</p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{standup.yesterday}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Today</p>
            <ul className="space-y-1">
              {standup.today_items.map((item, i) => {
                const conf = confirmations.find((c) => c.item_index === i);
                return (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    {conf ? (
                      conf.completed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      )
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                    )}
                    <span
                      className={conf?.completed === false ? 'line-through text-zinc-600' : ''}
                    >
                      {item}
                    </span>
                    {conf?.note && (
                      <span className="text-xs text-zinc-500 italic">— {conf.note}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {standup.blockers && (
            <div className="space-y-1 rounded-lg bg-orange-950/40 border border-orange-500/20 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-orange-500">Blocker</p>
              <p className="text-sm text-orange-300">{standup.blockers}</p>
            </div>
          )}

          {standup.slack_posted && (
            <div className="flex justify-end">
              <Badge variant="default" className="text-xs">
                Posted to Slack
              </Badge>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={startEditing}
          className="shrink-0 rounded-md p-1.5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          title="Edit standup"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
