import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StandupCard } from '@/components/standup/StandupCard';
import { MemberFilter } from '@/components/MemberFilter';
import { DateFilter } from '@/components/DateFilter';
import { StandupWithProfile, StandupConfirmation, CommentWithProfile, Profile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; from?: string; to?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const isManager = profile?.role === 'manager';
  const { member: selectedMemberId, from: fromDate, to: toDate } = await searchParams;

  let standups: StandupWithProfile[] = [];
  let activeMembers: Pick<Profile, 'id' | 'full_name'>[] = [];

  if (isManager) {
    // Fetch all active members for the filter
    const { data: members } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('is_active', true)
      .eq('role', 'member')
      .order('full_name');
    activeMembers = (members ?? []) as Pick<Profile, 'id' | 'full_name'>[];

    // Fetch standups — filtered by member and/or date
    let query = supabase
      .from('standups')
      .select('*, profiles(*)')
      .order('date', { ascending: false })
      .limit(60);

    if (selectedMemberId) query = query.eq('user_id', selectedMemberId);
    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);

    const { data } = await query;
    standups = (data ?? []) as StandupWithProfile[];
  } else {
    // Members see only their own history
    let query = supabase
      .from('standups')
      .select('*, profiles(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);

    const { data } = await query;
    standups = (data ?? []) as StandupWithProfile[];
  }

  const standupIds = standups.map((s) => s.id);

  const [{ data: allConfirmations }, { data: allComments }] = await Promise.all([
    standupIds.length
      ? supabase.from('standup_confirmations').select('*').in('standup_id', standupIds)
      : Promise.resolve({ data: [] }),
    standupIds.length
      ? supabase.from('standup_comments').select('*, profiles(id, full_name)').in('standup_id', standupIds).order('created_at')
      : Promise.resolve({ data: [] }),
  ]);

  const confirmationsByStandup = (allConfirmations ?? []).reduce<Record<string, StandupConfirmation[]>>(
    (acc, c) => { acc[c.standup_id] = [...(acc[c.standup_id] ?? []), c]; return acc; },
    {}
  );

  const commentsByStandup = ((allComments ?? []) as CommentWithProfile[]).reduce<Record<string, CommentWithProfile[]>>(
    (acc, c) => { acc[c.standup_id] = [...(acc[c.standup_id] ?? []), c]; return acc; },
    {}
  );

  // Group standups by date for display
  const byDate = standups.reduce<Record<string, StandupWithProfile[]>>((acc, s) => {
    acc[s.date] = [...(acc[s.date] ?? []), s];
    return acc;
  }, {});

  const selectedMemberName = selectedMemberId
    ? activeMembers.find((m) => m.id === selectedMemberId)?.full_name
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {isManager ? 'Team History' : 'My History'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {isManager
            ? selectedMemberName
              ? `Showing ${selectedMemberName}'s standups`
              : 'All members'
            : 'Your submitted standups'}
        </p>
      </div>

      {/* Member filter — managers only */}
      {isManager && (
        <MemberFilter members={activeMembers} selectedId={selectedMemberId ?? null} />
      )}

      {/* Date filter — both roles */}
      <DateFilter from={fromDate ?? null} to={toDate ?? null} />

      {!standups.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900 py-16 text-center">
          <CalendarDays className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-sm font-medium text-zinc-500">No standups found</p>
          <p className="mt-1 text-xs text-zinc-600">
            {isManager ? 'No standups have been submitted yet' : 'Your submitted standups will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byDate).map(([date, dayStandups]) => (
            <div key={date}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-600">
                {formatDate(date)}
              </p>
              <div className={`grid gap-4 ${isManager && !selectedMemberId ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-2xl'}`}>
                {dayStandups.map((standup) => (
                  <StandupCard
                    key={standup.id}
                    standup={standup}
                    confirmations={confirmationsByStandup[standup.id] ?? []}
                    showProfile={isManager}
                    currentUserId={user.id}
                    currentUserName={profile?.full_name ?? ''}
                    initialComments={commentsByStandup[standup.id] ?? []}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
