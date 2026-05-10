import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StandupCard } from '@/components/standup/StandupCard';
import { CheckInProgress } from '@/components/dashboard/CheckInProgress';
import { TeamSummaryCard } from '@/components/dashboard/TeamSummaryCard';
import { MemberActions } from '@/components/dashboard/MemberActions';
import { DeactivateMember } from '@/components/dashboard/DeactivateMember';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StandupWithProfile, CommentWithProfile, Profile, StandupViewWithProfile } from '@/lib/types';
import { formatDate, getTodayDate, getYesterdayDate } from '@/lib/utils';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ManagerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'manager') redirect('/standup');

  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // Parallel fetches
  const [
    { data: allProfilesData },
    { data: todayStandups },
    { data: yesterdayStandups },
  ] = await Promise.all([
    supabase.from('profiles').select('*').order('full_name'),
    supabase.from('standups').select('*, profiles(*)').eq('date', today).order('created_at'),
    supabase.from('standups').select('id, today_items').eq('date', yesterday),
  ]);

  const allProfiles = (allProfilesData ?? []) as Profile[];
  const activeProfiles = allProfiles.filter((p) => p.is_active);
  const inactiveProfiles = allProfiles.filter((p) => !p.is_active);

  const submitted = (todayStandups ?? []) as StandupWithProfile[];
  const submittedIds = new Set(submitted.map((s) => s.user_id));
  const blockersCount = submitted.filter((s) => s.blockers).length;

  // Intentions met: % of yesterday's confirmed items marked completed
  const yesterdayIds = (yesterdayStandups ?? []).map((s) => s.id);
  const { data: confirmations } = yesterdayIds.length
    ? await supabase.from('standup_confirmations').select('completed').in('standup_id', yesterdayIds)
    : { data: [] };

  const totalConfirmed = confirmations?.length ?? 0;
  const totalCompleted = (confirmations ?? []).filter((c) => c.completed).length;
  const intentionsMet = totalConfirmed > 0 ? Math.round((totalCompleted / totalConfirmed) * 100) : null;

  // Comments + views for today's standups
  const standupIds = submitted.map((s) => s.id);

  // Record current user's view for all today's standups
  if (standupIds.length) {
    await supabase.from('standup_views').upsert(
      standupIds.map((id) => ({ standup_id: id, viewer_id: user.id, viewed_at: new Date().toISOString() })),
      { onConflict: 'standup_id,viewer_id' }
    );
  }

  const [{ data: allComments }, { data: allViews }] = await Promise.all([
    standupIds.length
      ? supabase.from('standup_comments').select('*, profiles(id, full_name)').in('standup_id', standupIds).order('created_at')
      : Promise.resolve({ data: [] }),
    standupIds.length
      ? supabase.from('standup_views').select('*, profiles(id, full_name)').in('standup_id', standupIds)
      : Promise.resolve({ data: [] }),
  ]);

  const commentsByStandup = ((allComments ?? []) as CommentWithProfile[]).reduce<
    Record<string, CommentWithProfile[]>
  >((acc, c) => {
    acc[c.standup_id] = [...(acc[c.standup_id] ?? []), c];
    return acc;
  }, {});

  const viewsByStandup = ((allViews ?? []) as StandupViewWithProfile[]).reduce<
    Record<string, StandupViewWithProfile[]>
  >((acc, v) => {
    acc[v.standup_id] = [...(acc[v.standup_id] ?? []), v];
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">{formatDate(today)}</p>
        </div>
      </div>

      {/* Stats + roster */}
      <CheckInProgress
        submitted={submitted}
        allProfiles={activeProfiles}
        intentionsMet={intentionsMet}
        blockersCount={blockersCount}
      />

      {/* Team summary highlights */}
      {submitted.length > 0 && (
        <TeamSummaryCard standups={submitted} date={today} />
      )}

      {/* Standup cards */}
      {submitted.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-200">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-950 text-xs font-bold text-green-400 border border-green-800">
              {submitted.length}
            </span>
            Submitted today
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {submitted.map((standup) => (
              <StandupCard
                key={standup.id}
                standup={standup}
                currentUserId={user.id}
                currentUserName={profile?.full_name ?? ''}
                initialComments={commentsByStandup[standup.id] ?? []}
                views={viewsByStandup[standup.id] ?? []}
              />
            ))}
          </div>
        </section>
      )}

      {/* Team roster with role management */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-200">
          <Users className="h-4 w-4 text-zinc-600" />
          Full team ({activeProfiles.length})
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm divide-y divide-zinc-800">
          {activeProfiles.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar name={member.full_name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">{member.full_name}</p>
                  <Badge variant={member.role === 'manager' ? 'blue' : 'default'}>
                    {member.role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${submittedIds.has(member.id) ? 'text-green-400' : 'text-zinc-600'}`}>
                  {submittedIds.has(member.id) ? '✓ Submitted' : 'Pending'}
                </span>
                {member.id !== user.id && (
                  <MemberActions memberId={member.id} currentRole={member.role} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deactivated members */}
      {inactiveProfiles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-600">Removed members ({inactiveProfiles.length})</h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm divide-y divide-zinc-800">
            {inactiveProfiles.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3 opacity-50">
                <div className="flex items-center gap-3">
                  <Avatar name={member.full_name} size="sm" className="grayscale" />
                  <p className="text-sm font-medium text-zinc-400 line-through">{member.full_name}</p>
                </div>
                {member.id !== user.id && (
                  <DeactivateMember memberId={member.id} isActive={false} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
