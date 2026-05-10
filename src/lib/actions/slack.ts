'use server';

import { formatDate } from '@/lib/utils';
import { StandupWithProfile } from '@/lib/types';

async function postToSlack(payload: object): Promise<{ error?: string; success?: boolean }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl === 'your-slack-incoming-webhook-url') {
    return { error: 'Slack webhook not configured' };
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!res?.ok) return { error: 'Slack post failed' };
  return { success: true };
}

export async function postStandupToSlack(standup: StandupWithProfile) {
  const name = standup.profiles?.full_name ?? 'Team member';
  const firstName = name.split(' ')[0];
  const todayList = standup.today_items.map((item) => `• ${item}`).join('\n');

  const blocks: object[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📝 ${firstName}'s Standup`,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*${name}*  ·  ${formatDate(standup.date)}`,
        },
      ],
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*⏮ Yesterday*\n${standup.yesterday}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🚀 Today*\n${todayList}`,
      },
    },
  ];

  if (standup.blockers) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🚧 Blocker*\n${standup.blockers}`,
      },
    });
  }

  blocks.push({ type: 'divider' });

  await postToSlack({ blocks });
}

export async function postDailySummaryToSlack(
  submitted: StandupWithProfile[],
  missing: Array<{ full_name: string }>,
  date: string
) {
  const submittedNames = submitted.map((s) => s.profiles.full_name).join(', ') || 'None yet';
  const missingNames = missing.map((m) => m.full_name).join(', ');
  const blockers = submitted.filter((s) => s.blockers);
  const pct = submitted.length + missing.length === 0
    ? 0
    : Math.round((submitted.length / (submitted.length + missing.length)) * 100);

  const blocks: object[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📊 Team Standup Summary`,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: formatDate(date) }],
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Check-in rate*\n${submitted.length} / ${submitted.length + missing.length}  (${pct}%)`,
        },
        {
          type: 'mrkdwn',
          text: `*Blockers*\n${blockers.length === 0 ? 'None 🎉' : `${blockers.length} reported`}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `✅ *Checked in (${submitted.length}):*\n${submittedNames}`,
      },
    },
  ];

  if (missing.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `⏳ *Still waiting on (${missing.length}):*\n${missingNames}`,
      },
    });
  }

  if (blockers.length > 0) {
    const blockerLines = blockers
      .map((s) => `• *${s.profiles.full_name}:* ${s.blockers}`)
      .join('\n');
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🚧 *Blockers to address:*\n${blockerLines}`,
      },
    });
  }

  // Next highlights
  if (submitted.length > 0) {
    const highlights = submitted
      .map((s) => `• *${s.profiles.full_name.split(' ')[0]}:* ${s.today_items.join(' · ')}`)
      .join('\n');
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🚀 *Next highlights:*\n${highlights}`,
      },
    });
  }

  blocks.push({ type: 'divider' });

  return postToSlack({ blocks });
}
