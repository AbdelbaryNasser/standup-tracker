import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StandupCard } from '@/components/standup/StandupCard';
import { StandupWithProfile, StandupConfirmation, CommentWithProfile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: standups } = await supabase
    .from('standups')
    .select('*, profiles(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30);

  const standupIds = (standups ?? []).map((s) => s.id);

  // Fetch confirmations and comments in parallel
  const [{ data: allConfirmations }, { data: allComments }] = await Promise.all([
    standupIds.length
      ? supabase.from('standup_confirmations').select('*').in('standup_id', standupIds)
      : Promise.resolve({ data: [] }),
    standupIds.length
      ? supabase.from('standup_comments').select('*, profiles(id, full_name)').in('standup_id', standupIds).order('created_at')
      : Promise.resolve({ data: [] }),
  ]);

  const confirmationsByStandup = (allConfirmations ?? []).reduce<
    Record<string, StandupConfirmation[]>
  >((acc, c) => {
    acc[c.standup_id] = [...(acc[c.standup_id] ?? []), c];
    return acc;
  }, {});

  const commentsByStandup = ((allComments ?? []) as CommentWithProfile[]).reduce<
    Record<string, CommentWithProfile[]>
  >((acc, c) => {
    acc[c.standup_id] = [...(acc[c.standup_id] ?? []), c];
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My History</h1>
        <p className="mt-1 text-sm text-zinc-500">Your last 30 standups</p>
      </div>

      {!standups?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900 py-16 text-center">
          <CalendarDays className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-sm font-medium text-zinc-500">No standups yet</p>
          <p className="mt-1 text-xs text-zinc-600">Your submitted standups will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {standups.map((standup) => (
            <div key={standup.id}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-600">
                {formatDate(standup.date)}
              </p>
              <StandupCard
                standup={standup as StandupWithProfile}
                confirmations={confirmationsByStandup[standup.id] ?? []}
                showProfile={false}
                currentUserId={user.id}
                currentUserName={profile?.full_name ?? ''}
                initialComments={commentsByStandup[standup.id] ?? []}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
