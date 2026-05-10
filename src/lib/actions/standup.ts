'use server';

import { createClient } from '@/lib/supabase/server';
import { getTodayDate } from '@/lib/utils';
import { postStandupToSlack } from '@/lib/actions/slack';
import { revalidatePath } from 'next/cache';

export async function submitStandup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const yesterday = formData.get('yesterday') as string;
  const blockers = (formData.get('blockers') as string) || null;
  const todayItems: string[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('today_item_') && (value as string).trim()) {
      todayItems.push((value as string).trim());
    }
  }

  if (!yesterday.trim()) return { error: 'Yesterday field is required' };
  if (todayItems.length === 0) return { error: 'Add at least one item for today' };

  const { data: standup, error } = await supabase
    .from('standups')
    .insert({
      user_id: user.id,
      date: getTodayDate(),
      yesterday: yesterday.trim(),
      today_items: todayItems,
      blockers: blockers?.trim() || null,
    })
    .select('*, profiles(*)')
    .single();

  if (error) return { error: error.message };

  await postStandupToSlack(standup);

  revalidatePath('/');
  revalidatePath('/manager');
  return { success: true };
}

export async function confirmStandup(
  standupId: string,
  confirmations: Array<{ item_index: number; completed: boolean; note: string }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const rows = confirmations.map((c) => ({
    standup_id: standupId,
    item_index: c.item_index,
    completed: c.completed,
    note: c.note.trim() || null,
  }));

  const { error } = await supabase
    .from('standup_confirmations')
    .upsert(rows, { onConflict: 'standup_id,item_index' });

  if (error) return { error: error.message };

  revalidatePath('/');
  return { success: true };
}

export async function setMemberActive(memberId: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (caller?.role !== 'manager') return { error: 'Not authorized' };

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', memberId);

  if (error) return { error: error.message };

  revalidatePath('/manager');
  return { success: true };
}

export async function updateMemberRole(memberId: string, role: 'member' | 'manager') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (caller?.role !== 'manager') return { error: 'Not authorized' };

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', memberId);

  if (error) return { error: error.message };

  revalidatePath('/manager');
  return { success: true };
}
