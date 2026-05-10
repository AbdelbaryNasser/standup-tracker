'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addComment, deleteComment } from '@/lib/actions/comments';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommentWithProfile } from '@/lib/types';
import { MessageSquare, Send, Trash2, X, CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  standupId: string;
  currentUserId: string;
  currentUserName: string;
  initialComments: CommentWithProfile[];
}

export function CommentSection({ standupId, currentUserId, currentUserName, initialComments }: Props) {
  const [comments, setComments] = useState<CommentWithProfile[]>(initialComments);
  const [open, setOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${standupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'standup_comments', filter: `standup_id=eq.${standupId}` },
        async (payload) => {
          const { data } = await supabase
            .from('standup_comments')
            .select('*, profiles(id, full_name)')
            .eq('id', payload.new.id)
            .single();
          if (data) setComments((prev) => [...prev, data as CommentWithProfile]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'standup_comments', filter: `standup_id=eq.${standupId}` },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== (payload.old as { id: string }).id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [standupId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (replyingTo) setTimeout(() => replyRef.current?.focus(), 50);
  }, [replyingTo]);

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);
  const total = comments.length;

  function submitComment(content: string, parentId?: string) {
    if (!content.trim()) return;
    startTransition(async () => {
      await addComment(standupId, content, parentId);
      if (parentId) { setReplyText(''); setReplyingTo(null); }
      else setText('');
    });
  }

  function handleDelete(commentId: string) {
    setDeletingId(commentId);
    startTransition(async () => {
      await deleteComment(commentId);
      setDeletingId(null);
    });
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>, content: string, parentId?: string) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment(content, parentId);
    }
  }

  return (
    <div className="border-t border-zinc-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-500 hover:bg-zinc-800/50 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>{total === 0 ? 'Add comment' : `${total} comment${total !== 1 ? 's' : ''}`}</span>
        {total > 0 && !open && (
          <div className="ml-1 flex -space-x-1">
            {[...new Map(comments.map((c) => [c.user_id, c])).values()]
              .slice(0, 3)
              .map((c) => (
                <Avatar key={c.user_id} name={c.profiles.full_name} size="sm" className="ring-2 ring-zinc-900 h-5 w-5 text-[10px]" />
              ))}
          </div>
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {topLevel.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <CommentBubble
                comment={comment}
                currentUserId={currentUserId}
                onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                onDelete={() => handleDelete(comment.id)}
                isDeleting={deletingId === comment.id}
              />

              <div className="ml-7 space-y-2">
                {replies(comment.id).map((reply) => (
                  <div key={reply.id} className="flex items-start gap-1 text-zinc-600">
                    <CornerDownRight className="h-3 w-3 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <CommentBubble
                        comment={reply}
                        currentUserId={currentUserId}
                        onDelete={() => handleDelete(reply.id)}
                        isDeleting={deletingId === reply.id}
                        isReply
                      />
                    </div>
                  </div>
                ))}

                {replyingTo === comment.id && (
                  <div className="flex gap-2 pl-4">
                    <Avatar name={currentUserName} size="sm" className="mt-1 shrink-0 h-6 w-6 text-[10px]" />
                    <div className="flex-1 space-y-1">
                      <textarea
                        ref={replyRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => handleKey(e, replyText, comment.id)}
                        placeholder={`Reply to ${comment.profiles.full_name}… (Enter to send)`}
                        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => submitComment(replyText, comment.id)} loading={isPending} disabled={!replyText.trim()}>
                          <Send className="h-3 w-3" /> Send
                        </Button>
                        <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="text-zinc-500 hover:text-zinc-300">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <Avatar name={currentUserName} size="sm" className="mt-1 shrink-0 h-6 w-6 text-[10px]" />
            <div className="flex-1 space-y-1">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => handleKey(e, text)}
                placeholder="Leave a comment… (Enter to send, Shift+Enter for newline)"
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                rows={2}
              />
              <Button size="sm" onClick={() => submitComment(text)} loading={isPending} disabled={!text.trim()}>
                <Send className="h-3 w-3" /> Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BubbleProps {
  comment: CommentWithProfile;
  currentUserId: string;
  onReply?: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isReply?: boolean;
}

function CommentBubble({ comment, currentUserId, onReply, onDelete, isDeleting, isReply }: BubbleProps) {
  const isOwn = comment.user_id === currentUserId;

  return (
    <div className={cn('flex gap-2 group', isReply && 'text-sm')}>
      <Avatar name={comment.profiles.full_name} size="sm" className="mt-0.5 shrink-0 h-6 w-6 text-[10px]" />
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-zinc-800 border border-zinc-700/50 px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-xs font-semibold text-zinc-300">{comment.profiles.full_name}</span>
            <span className="text-[11px] text-zinc-600 shrink-0">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-zinc-400 whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onReply && (
            <button onClick={onReply} className="text-xs text-zinc-600 hover:text-blue-400 transition-colors">
              Reply
            </button>
          )}
          {isOwn && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="text-xs text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
