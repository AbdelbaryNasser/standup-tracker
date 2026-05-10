-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'member' check (role in ('member', 'manager')),
  slack_user_id text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Standups
create table if not exists standups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  yesterday text not null,
  today_items text[] not null default '{}',
  blockers text,
  slack_posted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Next-day confirmations
create table if not exists standup_confirmations (
  id uuid primary key default gen_random_uuid(),
  standup_id uuid not null references standups(id) on delete cascade,
  item_index integer not null,
  completed boolean not null default false,
  note text,
  confirmed_at timestamptz not null default now(),
  unique(standup_id, item_index)
);

-- RLS
alter table profiles enable row level security;
alter table standups enable row level security;
alter table standup_confirmations enable row level security;

-- Profiles policies
create policy "Authenticated users can view all profiles"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Managers can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- Standups policies
create policy "Authenticated users can view all standups"
  on standups for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own standups"
  on standups for insert
  with check (auth.uid() = user_id);

create policy "Users can update own standups"
  on standups for update
  using (auth.uid() = user_id);

-- Confirmations policies
create policy "Authenticated users can view all confirmations"
  on standup_confirmations for select
  using (auth.role() = 'authenticated');

create policy "Users can insert confirmations for own standups"
  on standup_confirmations for insert
  with check (
    exists (
      select 1 from standups
      where id = standup_id and user_id = auth.uid()
    )
  );

create policy "Users can update own confirmations"
  on standup_confirmations for update
  using (
    exists (
      select 1 from standups
      where id = standup_id and user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists standups_date_idx on standups(date);
create index if not exists standups_user_id_idx on standups(user_id);
create index if not exists standup_confirmations_standup_id_idx on standup_confirmations(standup_id);
