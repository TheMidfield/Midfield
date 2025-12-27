-- Create topic_votes table for upvote/downvote functionality
create table public.topic_votes (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references public.topics(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  vote_type text check (vote_type in ('upvote', 'downvote')) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Ensure one vote per user per topic
  unique(topic_id, user_id)
);

-- Enable RLS
alter table public.topic_votes enable row level security;

-- Policies
-- Anyone can view vote counts
create policy "Vote counts are viewable by everyone."
  on public.topic_votes for select
  using (true);

-- Authenticated users can insert their own votes
create policy "Authenticated users can insert votes."
  on public.topic_votes for insert
  with check (auth.uid() = user_id);

-- Users can update their own votes (change upvote to downvote, etc.)
create policy "Users can update their own votes."
  on public.topic_votes for update
  using (auth.uid() = user_id);

-- Users can delete their own votes
create policy "Users can delete their own votes."
  on public.topic_votes for delete
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index topic_votes_topic_id_idx on public.topic_votes(topic_id);
create index topic_votes_user_id_idx on public.topic_votes(user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.topic_votes
  for each row
  execute function public.handle_updated_at();
