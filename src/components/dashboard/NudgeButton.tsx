'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { nudgeMissingMembers } from '@/lib/actions/slack';
import { BellRing, CheckCheck, ChevronDown } from 'lucide-react';

interface MissingMember {
  id: string;
  full_name: string;
  slack_user_id: string | null;
}

export function NudgeButton({ missingMembers }: { missingMembers: MissingMember[] }) {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(missingMembers.map((m) => m.id))
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (missingMembers.length === 0) return null;

  const allSelected = selectedIds.size === missingMembers.length;

  function toggleAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(missingMembers.map((m) => m.id))
    );
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleNudge() {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      const result = await nudgeMissingMembers(Array.from(selectedIds));
      setStatus(result.error ? 'error' : 'sent');
      setIsOpen(false);
      if (!result.error) setTimeout(() => setStatus('idle'), 4000);
    });
  }

  if (status === 'sent') {
    return (
      <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-green-400 bg-green-950/40 border border-green-800/50">
        <CheckCheck className="h-4 w-4" />
        Nudge sent
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:border-orange-700 hover:bg-orange-950/30 hover:text-orange-300 transition-colors disabled:opacity-50"
      >
        <BellRing className="h-4 w-4" />
        {isPending ? 'Sending…' : `Nudge ${missingMembers.length} ${missingMembers.length === 1 ? 'member' : 'members'}`}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        {status === 'error' && <span className="text-red-400 ml-1">— failed</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          <div className="px-3 py-2.5 border-b border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-zinc-600 bg-zinc-800 accent-orange-500"
              />
              Select all ({missingMembers.length})
            </label>
          </div>
          <div className="max-h-52 overflow-y-auto p-1">
            {missingMembers.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg hover:bg-zinc-800 text-sm select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(member.id)}
                  onChange={() => toggle(member.id)}
                  className="rounded border-zinc-600 bg-zinc-800 accent-orange-500"
                />
                <span className="flex-1 text-zinc-200">{member.full_name}</span>
                <span className={`text-xs ${member.slack_user_id ? 'text-zinc-500' : 'text-zinc-700'}`}>
                  {member.slack_user_id ? 'Slack' : 'no Slack'}
                </span>
              </label>
            ))}
          </div>
          <div className="p-2 border-t border-zinc-800">
            <button
              onClick={handleNudge}
              disabled={selectedIds.size === 0 || isPending}
              className="w-full rounded-lg bg-orange-950/60 border border-orange-800/50 px-3 py-1.5 text-sm font-medium text-orange-300 hover:bg-orange-900/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending
                ? 'Sending…'
                : `Nudge ${selectedIds.size} ${selectedIds.size === 1 ? 'person' : 'people'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
