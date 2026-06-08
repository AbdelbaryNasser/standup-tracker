'use client';

import { useState, useTransition } from 'react';
import { nudgeMissingMembers } from '@/lib/actions/slack';
import { BellRing, CheckCheck } from 'lucide-react';

export function NudgeButton({ missingCount }: { missingCount: number }) {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  if (missingCount === 0) return null;

  function handleNudge() {
    startTransition(async () => {
      const result = await nudgeMissingMembers();
      setStatus(result.error ? 'error' : 'sent');
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
    <button
      onClick={handleNudge}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:border-orange-700 hover:bg-orange-950/30 hover:text-orange-300 transition-colors disabled:opacity-50"
    >
      <BellRing className="h-4 w-4" />
      {isPending ? 'Sending…' : `Nudge ${missingCount} ${missingCount === 1 ? 'member' : 'members'}`}
      {status === 'error' && <span className="text-red-400 ml-1">— failed</span>}
    </button>
  );
}
