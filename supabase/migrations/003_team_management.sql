-- Soft-delete support for profiles
alter table profiles add column if not exists is_active boolean not null default true;

-- Standup views (read receipts)
create table if not exists standup_views (
  id uuid primary key default gen_random_uuid(),
  standup_id uuid not null references standups(id) on delete cascade,
  viewer_id uuid not null references profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique(standup_id, viewer_id)
);

alter table standup_views enable row level security;

create policy "Authenticated users can view all standup views"
  on standup_views for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own views"
  on standup_views for insert
  with check (auth.uid() = viewer_id);

create policy "Users can update own views"
  on standup_views for update
  using (auth.uid() = viewer_id);

create index if not exists standup_views_standup_id_idx on standup_views(standup_id);
create index if not exists standup_views_viewer_id_idx on standup_views(viewer_id);
