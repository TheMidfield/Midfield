-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  full_name text,
  created_at timestamptz default now()
);

-- Create topics table
create table public.topics (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  image_url text,
  type text check (type in ('player', 'club', 'team', 'other')),
  created_at timestamptz default now()
);

-- Create posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references public.topics not null,
  user_id uuid references public.users not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.topics enable row level security;
alter table public.posts enable row level security;

-- Policies
create policy "Public topics are viewable by everyone." on public.topics for select using (true);
create policy "Public posts are viewable by everyone." on public.posts for select using (true);
create policy "Authenticated users can insert posts." on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own profile." on public.users for update using (auth.uid() = id);
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
