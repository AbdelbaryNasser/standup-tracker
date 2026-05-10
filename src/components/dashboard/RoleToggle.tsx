'use client';

import { useTransition } from 'react';
import { updateMemberRole } from '@/lib/actions/standup';
import { Role } from '@/lib/types';

interface Props {
  memberId: string;
  currentRole: Role;
}

export function RoleToggle({ memberId, currentRole }: Props) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = currentRole === 'manager' ? 'member' : 'manager';
    startTransition(async () => { await updateMemberRole(memberId, next); });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="text-xs text-gray-400 hover:text-blue-600 underline underline-offset-2 disabled:opacity-50 transition-colors"
    >
      {isPending ? '...' : currentRole === 'manager' ? 'Remove manager' : 'Make manager'}
    </button>
  );
}
