import { Avatar } from '@/components/ui/avatar';
import { StandupWithProfile, Profile } from '@/lib/types';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  submitted: StandupWithProfile[];
  allProfiles: Profile[];
  intentionsMet: number | null;
  blockersCount: number;
}

export function CheckInProgress({ submitted, allProfiles, intentionsMet, blockersCount }: Props) {
  const submittedIds = new Set(submitted.map((s) => s.user_id));
  const missing = allProfiles.filter((p) => !submittedIds.has(p.id));
  const total = allProfiles.length;
  const checkedIn = submitted.length;
  const participationPct = total === 0 ? 0 : Math.round((checkedIn / total) * 100);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Check-in"
          value={`${checkedIn} / ${total}`}
          sub={`${participationPct}% participation`}
          color="blue"
          pct={participationPct}
        />
        <StatCard
          label="Intentions met"
          value={intentionsMet !== null ? `${intentionsMet}%` : '—'}
          sub={intentionsMet !== null ? 'yesterday' : 'no data yet'}
          color="green"
          pct={intentionsMet ?? 0}
        />
        <StatCard
          label="Blockers"
          value={blockersCount === 0 ? '—' : String(blockersCount)}
          sub={blockersCount === 0 ? 'none today' : 'need attention'}
          color={blockersCount > 0 ? 'orange' : 'zinc'}
        />
      </div>

      {/* Roster */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-400">Team roster</h3>
        </div>

        <div className="flex flex-wrap gap-4">
          {allProfiles.map((profile) => {
            const hasCheckedIn = submittedIds.has(profile.id);
            const standup = submitted.find((s) => s.user_id === profile.id);
            const hasBlocker = Boolean(standup?.blockers);

            return (
              <div key={profile.id} className="flex flex-col items-center gap-1.5 w-14">
                <div className="relative">
                  <Avatar
                    name={profile.full_name}
                    size="lg"
                    className={cn(!hasCheckedIn && 'opacity-30 grayscale')}
                  />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-zinc-900 text-white',
                      hasCheckedIn
                        ? hasBlocker ? 'bg-orange-500' : 'bg-green-500'
                        : 'bg-zinc-600'
                    )}
                  >
                    {hasCheckedIn ? (
                      hasBlocker
                        ? <AlertTriangle className="h-2.5 w-2.5" />
                        : <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : (
                      <Clock className="h-2.5 w-2.5" />
                    )}
                  </span>
                </div>
                <span className={cn(
                  'text-center text-xs leading-tight',
                  hasCheckedIn ? 'font-medium text-zinc-300' : 'text-zinc-600'
                )}>
                  {profile.full_name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {missing.length > 0 && (
          <p className="mt-4 text-xs text-zinc-600 border-t border-zinc-800 pt-3">
            Still waiting on:{' '}
            <span className="font-medium text-zinc-400">
              {missing.map((m) => m.full_name.split(' ')[0]).join(', ')}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'green' | 'orange' | 'zinc';
  pct?: number;
}

function StatCard({ label, value, sub, color, pct }: StatCardProps) {
  const trackColor = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-400',
    zinc: 'bg-zinc-600',
  }[color];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm px-4 py-3 space-y-2">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      {pct !== undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn('h-full rounded-full transition-all duration-700', trackColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <p className="text-xs text-zinc-600">{sub}</p>
    </div>
  );
}
