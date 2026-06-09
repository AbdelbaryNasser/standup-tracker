# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # ESLint (no test suite)
```

## Stack

- **Next.js 16.2.6** + **React 19** — App Router, all pages are Server Components by default
- **Supabase** — auth (email/password) + Postgres database via `@supabase/ssr`
- **Tailwind CSS v4** (PostCSS plugin, not the v3 CLI — config lives in `globals.css`, not `tailwind.config.js`)
- TypeScript, `clsx` + `tailwind-merge` via `cn()` in `src/lib/utils.ts`

## Architecture

### Route groups

```
src/app/
  (auth)/          # unauthenticated: /login, /register
  (app)/           # authenticated shell with Sidebar
    standup/       # member landing — submit today's standup
    manager/       # manager-only team dashboard
    history/       # standup history (role-scoped)
    team/          # team page
  page.tsx         # root redirect (/)
```

### Middleware

The file is `src/proxy.ts` (not `middleware.ts`). It exports `proxy` and `config`. This is the Next.js 16 convention — read `node_modules/next/dist/docs/` before touching it. It gates all routes: unauthenticated → `/login`, authenticated on auth routes → `/`.

### Data flow

Pages are async Server Components that call Supabase directly. Mutations go through `'use server'` actions in `src/lib/actions/`. After mutations, `revalidatePath()` is called to bust the relevant page cache. There is no client-side state management library.

### Supabase clients

- `src/lib/supabase/server.ts` — for Server Components and server actions (uses `cookies()` from `next/headers`)
- `src/lib/supabase/client.ts` — for Client Components (browser)

Always `await createClient()` — both return a Promise.

### Role system

`profiles.role` is either `'member'` or `'manager'`. Role checks happen at the page level:
- Members are redirected away from `/manager`; managers are redirected away from `/standup`
- Manager-only server actions re-check role server-side before executing

### Database tables

`profiles`, `standups`, `standup_confirmations`, `standup_comments`, `standup_views`

`standups.today_items` is a Postgres `text[]` array. `standups.yesterday` is a newline-joined string.

### Slack integration

`src/lib/actions/slack.ts` posts to `SLACK_WEBHOOK_URL` using Slack Block Kit. Called automatically on `submitStandup`. `nudgeMissingMembers` uses `profiles.slack_user_id` to mention users directly.

### Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SLACK_WEBHOOK_URL
```
