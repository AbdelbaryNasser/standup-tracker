'use client';

import { useTransition } from 'react';
import { setMemberActive } from '@/lib/actions/standup';

interface Props {
  memberId: string;
  isActive: boolean;
}

export function DeactivateMember({ memberId, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => { await setMemberActive(memberId, !isActive); });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`text-xs underline underline-offset-2 disabled:opacity-50 transition-colors ${
        isActive
          ? 'text-red-400 hover:text-red-300'
          : 'text-green-400 hover:text-green-300'
      }`}
    >
      {isPending ? '...' : isActive ? 'Remove' : 'Restore'}
    </button>
  );
}
