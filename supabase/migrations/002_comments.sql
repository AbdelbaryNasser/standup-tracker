create table if not exists standup_comments (
  id uuid primary key default gen_random_uuid(),
  standup_id uuid not null references standups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references standup_comments(id) on delete cascade,
  content text not null check (char_length(content) > 0),
  created_at timestamptz not null default now()
);

alter table standup_comments enable row level security;

create policy "Authenticated users can view all comments"
  on standup_comments for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own comments"
  on standup_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on standup_comments for delete
  using (auth.uid() = user_id);

create index if not exists standup_comments_standup_id_idx on standup_comments(standup_id);
create index if not exists standup_comments_parent_id_idx on standup_comments(parent_id);

-- Enable realtime for comments
alter publication supabase_realtime add table standup_comments;
