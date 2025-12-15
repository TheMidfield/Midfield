-- Create reactions table
create table public.reactions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  reaction_type text check (reaction_type in ('fire', 'hmm', 'fair', 'dead')) not null,
  created_at timestamptz default now(),
  unique(post_id, user_id) -- One reaction per user per post
);

-- Enable RLS
alter table public.reactions enable row level security;

-- Policies
create policy "Public reactions are viewable by everyone."
  on public.reactions for select using (true);

create policy "Authenticated users can add reactions."
  on public.reactions for insert with check (auth.uid() = user_id);

create policy "Users can update their own reactions."
  on public.reactions for update using (auth.uid() = user_id);

create policy "Users can delete their own reactions."
  on public.reactions for delete using (auth.uid() = user_id);

-- Index for faster lookups
create index idx_reactions_post_id on public.reactions(post_id);
create index idx_reactions_user_id on public.reactions(user_id);

-- Function to update reaction_count on posts when reactions change
create or replace function public.update_post_reaction_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts
    set reaction_count = reaction_count + 1
    where id = NEW.post_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.posts
    set reaction_count = reaction_count - 1
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for reaction count updates
create trigger on_reaction_change
  after insert or delete on public.reactions
  for each row execute function public.update_post_reaction_count();
