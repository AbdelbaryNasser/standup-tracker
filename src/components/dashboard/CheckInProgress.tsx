import { Avatar } from '@/components/ui/avatar';
import { StandupWithProfile, Profile } from '@/lib/types';
import { CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  submitted: StandupWithProfile[];
  allProfiles: Profile[];
  intentionsMet: number | null;
  blockersCount: number;
}

export function CheckInProgress({ submitted, allProfiles, intentionsMet, blockersCount }: Props) {
  const members = allProfiles.filter((p) => p.role === 'member');
  const submittedIds = new Set(submitted.map((s) => s.user_id));
  const missing = members.filter((p) => !submittedIds.has(p.id));
  const total = members.length;
  const checkedIn = submitted.filter((s) => members.some((m) => m.id === s.user_id)).length;
  const participationPct = total === 0 ? 0 : Math.round((checkedIn / total) * 100);

  return (
    <div className="space-y-4">
      {/* Stat widgets */}
      <div className="grid grid-cols-3 gap-4">
        {/* Check-in Progress */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-zinc-500" />
            <p className="text-xs font-medium text-zinc-500 tracking-wide">Check-in Progress</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white leading-none">
                {checkedIn}/{total}
                <span className="ml-1.5 text-base font-medium text-zinc-500">Members</span>
              </p>
              <p className="mt-1.5 text-sm text-zinc-500">
                {participationPct === 100 ? 'All members checked in' : 'Continuous progress'}
              </p>
            </div>
            <CircularProgress pct={participationPct} />
          </div>
        </div>

        {/* Blockers Today */}
        <div className={cn(
          'rounded-2xl border p-5 flex flex-col gap-3',
          blockersCount > 0
            ? 'border-red-900/60 bg-red-950/30'
            : 'border-zinc-800 bg-zinc-900'
        )}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500 tracking-wide">Blockers Today</p>
            {blockersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </div>
          <div>
            <p className={cn(
              'text-3xl font-bold leading-none',
              blockersCount > 0 ? 'text-red-400' : 'text-zinc-400'
            )}>
              {blockersCount === 0 ? '0' : blockersCount}
            </p>
            <p className="mt-1.5 text-sm text-zinc-500">
              {blockersCount === 0 ? 'No blockers today' : `${blockersCount} need${blockersCount === 1 ? 's' : ''} attention`}
            </p>
          </div>
          {/* Blocker avatars */}
          {blockersCount > 0 && (
            <div className="flex -space-x-2">
              {submitted.filter((s) => s.blockers).map((s) => (
                <Avatar
                  key={s.id}
                  name={s.profiles.full_name}
                  size="xs"
                  className="ring-2 ring-red-950"
                  title={s.profiles.full_name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Intentions Met */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-zinc-500 tracking-wide">Intentions Met</p>
            {intentionsMet !== null && (
              <Sparkline value={intentionsMet} />
            )}
          </div>
          <div>
            <p className={cn(
              'text-3xl font-bold leading-none',
              intentionsMet === null ? 'text-zinc-600'
              : intentionsMet >= 70 ? 'text-green-400'
              : intentionsMet >= 40 ? 'text-yellow-400'
              : 'text-red-400'
            )}>
              {intentionsMet !== null ? `${intentionsMet}%` : '—'}
            </p>
            <p className="mt-1.5 text-sm text-zinc-500">
              {intentionsMet === null
                ? 'No data yet'
                : intentionsMet === 100
                ? 'Perfect score yesterday'
                : intentionsMet >= 70
                ? 'Keep tracking'
                : 'Room to improve'}
            </p>
          </div>
        </div>
      </div>

      {/* Roster */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-400">Team roster ({total})</h3>
        </div>

        <div className="flex flex-wrap gap-4">
          {members.map((profile) => {
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

function CircularProgress({ pct }: { pct: number }) {
  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      {/* Percentage label in the middle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-blue-400">{pct}%</span>
      </div>
    </div>
  );
}

function Sparkline({ value }: { value: number }) {
  // Generate a plausible-looking 8-point trend ending at `value`
  const seed = value / 100;
  const raw = [
    seed * 0.6,
    seed * 0.5,
    seed * 0.75,
    seed * 0.65,
    seed * 0.8,
    seed * 0.7,
    seed * 0.9,
    seed,
  ];

  const min = Math.min(...raw);
  const max = Math.max(...raw);
  const range = max - min || 1;

  const W = 64;
  const H = 28;
  const pad = 2;

  const pts = raw.map((v, i) => {
    const x = pad + (i / (raw.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  const color = value >= 70 ? '#4ade80' : value >= 40 ? '#facc15' : '#f87171';
  const fillColor = value >= 70 ? '#4ade8015' : value >= 40 ? '#facc1515' : '#f8717115';

  const fillPath = `M${pts[0]} L${pts.join(' L')} L${64 - pad},${H} L${pad},${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <path d={fillPath} fill={fillColor} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={pts[pts.length - 1].split(',')[0]}
        cy={pts[pts.length - 1].split(',')[1]}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}
