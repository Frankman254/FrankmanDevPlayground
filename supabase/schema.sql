create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists playground_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('game', 'app', 'experiment')),
  status text not null check (status in ('live', 'coming-soon')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_slug text not null references playground_items (slug) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, item_slug)
);

create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  item_slug text not null references playground_items (slug) on delete cascade,
  score integer,
  result text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists todo_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'My tasks',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists todo_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references todo_lists (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

alter table profiles enable row level security;
alter table favorites enable row level security;
alter table game_sessions enable row level security;
alter table todo_lists enable row level security;
alter table todo_items enable row level security;

create policy "profiles are readable by everyone"
on profiles for select
using (true);

create policy "users manage own profile"
on profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users manage own favorites"
on favorites for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own game sessions"
on game_sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own todo lists"
on todo_lists for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own todo items"
on todo_items for all
using (
  exists (
    select 1
    from todo_lists
    where todo_lists.id = todo_items.list_id
      and todo_lists.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from todo_lists
    where todo_lists.id = todo_items.list_id
      and todo_lists.user_id = auth.uid()
  )
);
