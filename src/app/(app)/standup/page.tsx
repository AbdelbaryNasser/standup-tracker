import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StandupForm } from '@/components/standup/StandupForm';
import { ConfirmationForm } from '@/components/standup/ConfirmationForm';
import { StandupCard } from '@/components/standup/StandupCard';
import { formatDate, getTodayDate, getYesterdayDate } from '@/lib/utils';
import { StandupWithProfile, StandupConfirmation, CommentWithProfile } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

export default async function StandupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // Fetch current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch today's standup
  const { data: todayStandup } = await supabase
    .from('standups')
    .select('*, profiles(*)')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  // Fetch yesterday's standup
  const { data: yesterdayStandup } = await supabase
    .from('standups')
    .select('*, profiles(*)')
    .eq('user_id', user.id)
    .eq('date', yesterday)
    .maybeSingle();

  // Fetch existing confirmations for yesterday's standup
  let confirmations: StandupConfirmation[] = [];
  if (yesterdayStandup) {
    const { data } = await supabase
      .from('standup_confirmations')
      .select('*')
      .eq('standup_id', yesterdayStandup.id);
    confirmations = data ?? [];
  }

  // Fetch comments for today's standup
  let todayComments: CommentWithProfile[] = [];
  if (todayStandup) {
    const { data } = await supabase
      .from('standup_comments')
      .select('*, profiles(id, full_name)')
      .eq('standup_id', todayStandup.id)
      .order('created_at');
    todayComments = (data ?? []) as CommentWithProfile[];
  }

  const hasUnconfirmedItems =
    yesterdayStandup &&
    yesterdayStandup.today_items.length > 0 &&
    confirmations.length < yesterdayStandup.today_items.length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Standup</h1>
        <p className="mt-1 text-sm text-zinc-500">{formatDate(today)}</p>
      </div>

      {/* Yesterday's confirmation */}
      {hasUnconfirmedItems && !todayStandup && (
        <section className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-6">
          <h2 className="text-base font-semibold text-blue-300 mb-4">
            How did yesterday go?
          </h2>
          <ConfirmationForm
            standupId={yesterdayStandup!.id}
            standupDate={yesterdayStandup!.date}
            items={yesterdayStandup!.today_items}
          />
        </section>
      )}

      {/* Already submitted today */}
      {todayStandup ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">You've submitted today's standup</span>
          </div>
          <StandupCard
            standup={todayStandup as StandupWithProfile}
            showProfile={false}
            currentUserId={user.id}
            currentUserName={profile?.full_name ?? ''}
            initialComments={todayComments}
          />
        </section>
      ) : (
        /* Standup form */
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-100 mb-6">
            Submit today's standup
          </h2>
          <StandupForm />
        </section>
      )}
    </div>
  );
}
