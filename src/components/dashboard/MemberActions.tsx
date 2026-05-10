'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { MoreHorizontal, Shield, ShieldOff, UserX } from 'lucide-react';
import { updateMemberRole, setMemberActive } from '@/lib/actions/standup';
import { Role } from '@/lib/types';

interface Props {
  memberId: string;
  currentRole: Role;
}

export function MemberActions({ memberId, currentRole }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleRole() {
    const next = currentRole === 'manager' ? 'member' : 'manager';
    startTransition(async () => {
      await updateMemberRole(memberId, next);
      setOpen(false);
    });
  }

  function remove() {
    startTransition(async () => {
      await setMemberActive(memberId, false);
      setOpen(false);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[168px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1">
          <button
            onClick={toggleRole}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            {currentRole === 'manager'
              ? <ShieldOff className="h-4 w-4 text-zinc-500" />
              : <Shield className="h-4 w-4 text-blue-400" />}
            {currentRole === 'manager' ? 'Remove manager' : 'Make manager'}
          </button>
          <div className="h-px bg-zinc-800 mx-2" />
          <button
            onClick={remove}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <UserX className="h-4 w-4" />
            Remove from team
          </button>
        </div>
      )}
    </div>
  );
}
