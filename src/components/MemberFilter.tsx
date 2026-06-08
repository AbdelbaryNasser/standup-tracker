'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';

interface Member {
  id: string;
  full_name: string;
}

export function MemberFilter({ members, selectedId }: { members: Member[]; selectedId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      params.delete('member');
    } else {
      params.set('member', id);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('all')}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          !selectedId
            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border border-transparent'
        }`}
      >
        All members
      </button>
      {members.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedId === m.id
              ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border border-transparent'
          }`}
        >
          <Avatar name={m.full_name} size="xs" />
          {m.full_name}
        </button>
      ))}
    </div>
  );
}
