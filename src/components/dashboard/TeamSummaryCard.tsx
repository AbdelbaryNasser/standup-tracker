import { StandupWithProfile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';

interface Props {
  standups: StandupWithProfile[];
  date: string;
}

export function TeamSummaryCard({ standups, date }: Props) {
  if (!standups.length) return null;

  return (
    <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-zinc-900 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-zinc-100">Next highlights</p>
          <p className="text-xs text-zinc-500">{formatDate(date)}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {standups.map((s) => (
          <div key={s.id} className="flex items-start gap-2.5">
            <Avatar name={s.profiles.full_name} size="sm" className="mt-0.5 shrink-0" />
            <p className="text-sm text-zinc-400 leading-relaxed">
              <span className="font-semibold text-blue-400">{s.profiles.full_name.split(' ')[0]}:</span>{' '}
              {s.today_items.join(' · ')}
              {s.blockers && (
                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 text-xs font-medium text-orange-400">
                  ⚠ blocked
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
