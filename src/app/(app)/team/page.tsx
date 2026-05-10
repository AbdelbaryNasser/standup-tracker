import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StandupCard } from '@/components/standup/StandupCard';
import { StandupWithProfile, CommentWithProfile, StandupViewWithProfile } from '@/lib/types';
import { formatDate, getTodayDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const today = getTodayDate();

  const { data: todayStandups } = await supabase
    .from('standups')
    .select('*, profiles(*)')
    .eq('date', today)
    .order('created_at');

  const submitted = (todayStandups ?? []) as StandupWithProfile[];
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
      <div>
        <h1 className="text-2xl font-bold text-white">Team Feed</h1>
        <p className="mt-1 text-sm text-zinc-500">{formatDate(today)}</p>
      </div>

      {submitted.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500 text-sm">No standups submitted yet today.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
