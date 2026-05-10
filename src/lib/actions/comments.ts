'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addComment(
  standupId: string,
  content: string,
  parentId?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  if (!content.trim()) return { error: 'Comment cannot be empty' };

  const { error } = await supabase.from('standup_comments').insert({
    standup_id: standupId,
    user_id: user.id,
    parent_id: parentId ?? null,
    content: content.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/manager');
  revalidatePath('/history');
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('standup_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/manager');
  revalidatePath('/history');
  return { success: true };
}
