import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CommentSection } from '@/components/standup/CommentSection';
import { StandupWithProfile, StandupConfirmation, CommentWithProfile, StandupViewWithProfile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, XCircle, Circle, AlertTriangle, Eye } from 'lucide-react';

interface Props {
  standup: StandupWithProfile;
  confirmations?: StandupConfirmation[];
  showProfile?: boolean;
  compact?: boolean;
  currentUserId?: string;
  currentUserName?: string;
  initialComments?: CommentWithProfile[];
  views?: StandupViewWithProfile[];
}

export function StandupCard({ standup, confirmations = [], showProfile = true, compact = false, currentUserId, currentUserName, initialComments, views }: Props) {
  const hasBlockers = Boolean(standup.blockers);

  return (
    <div className={`rounded-xl border bg-zinc-900 shadow-sm ${hasBlockers ? 'border-orange-500/30' : 'border-zinc-800'}`}>
      {hasBlockers && (
        <div className="flex items-center gap-2 rounded-t-xl bg-orange-950/50 px-4 py-2 text-sm font-medium text-orange-400 border-b border-orange-500/20">
          <AlertTriangle className="h-4 w-4" />
          Has blockers
        </div>
      )}

      <div className="p-4 space-y-4">
        {showProfile && (
          <div className="flex items-center gap-3">
            <Avatar name={standup.profiles.full_name} size="md" />
            <div>
              <p className="font-medium text-zinc-100">{standup.profiles.full_name}</p>
              <p className="text-xs text-zinc-500">{formatDate(standup.date)}</p>
            </div>
          </div>
        )}

        {!compact && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Yesterday</p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{standup.yesterday}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Today</p>
          <ul className="space-y-1">
            {standup.today_items.map((item, i) => {
              const conf = confirmations.find((c) => c.item_index === i);
              return (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  {conf ? (
                    conf.completed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    )
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                  )}
                  <span className={conf?.completed === false ? 'line-through text-zinc-600' : ''}>
                    {item}
                  </span>
                  {conf?.note && (
                    <span className="text-xs text-zinc-500 italic">— {conf.note}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {hasBlockers && (
          <div className="space-y-1 rounded-lg bg-orange-950/40 border border-orange-500/20 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-500">Blocker</p>
            <p className="text-sm text-orange-300">{standup.blockers}</p>
          </div>
        )}

        {standup.slack_posted && (
          <div className="flex justify-end">
            <Badge variant="default" className="text-xs">Posted to Slack</Badge>
          </div>
        )}
      </div>

      {views && views.length > 0 && (() => {
        const viewers = views.filter((v) => v.viewer_id !== standup.user_id);
        if (!viewers.length) return null;
        return (
          <div className="px-4 pb-3 flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
            <div className="flex -space-x-1.5">
              {viewers.slice(0, 5).map((v) => (
                <Avatar
                  key={v.viewer_id}
                  name={v.profiles.full_name}
                  size="xs"
                  className="ring-2 ring-zinc-900"
                  title={v.profiles.full_name}
                />
              ))}
            </div>
            {viewers.length > 5 && (
              <span className="text-xs text-zinc-600">+{viewers.length - 5}</span>
            )}
          </div>
        );
      })()}

      {currentUserId && currentUserName && (
        <CommentSection
          standupId={standup.id}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          initialComments={initialComments ?? []}
        />
      )}
    </div>
  );
}
