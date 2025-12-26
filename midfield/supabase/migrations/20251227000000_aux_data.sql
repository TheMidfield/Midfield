-- Create fixtures table ("Auxiliary Table" - No slug/page)
create table public.fixtures (
    id bigint primary key, -- TheSportsDB Event ID
    home_team_id uuid references public.topics(id) on delete cascade not null,
    away_team_id uuid references public.topics(id) on delete cascade not null,
    competition_id uuid references public.topics(id) on delete cascade not null,
    gameweek int,
    date timestamptz not null,
    status text, -- 'Not Started', 'FT', 'PPD'
    home_score int,
    away_score int,
    venue text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Associate fixtures with clubs for easy querying
create index fixtures_home_team_idx on public.fixtures(home_team_id);
create index fixtures_away_team_idx on public.fixtures(away_team_id);
create index fixtures_competition_idx on public.fixtures(competition_id);
create index fixtures_date_idx on public.fixtures(date);

-- Enable RLS
alter table public.fixtures enable row level security;

-- Policies: Public Read, Service Role Write
create policy "Public fixtures are viewable by everyone." on public.fixtures for select using (true);
create policy "Service role manages fixtures." on public.fixtures for all using (auth.role() = 'service_role');


-- Create league_standings table (Transient / Daily Refresh)
create table public.league_standings (
    id serial primary key,
    league_id uuid references public.topics(id) on delete cascade not null,
    team_id uuid references public.topics(id) on delete cascade not null,
    rank int not null,
    points int default 0,
    played int default 0,
    goals_diff int default 0,
    goals_for int default 0,
    goals_against int default 0,
    form text, -- e.g. "WWLDW"
    description text, -- e.g. "Promotion - Champions League"
    updated_at timestamptz default now()
);

-- Unique constraint to prevent duplicates per refresh (though we might wipe/replace)
create unique index league_standings_unique_idx on public.league_standings(league_id, team_id);

-- Enable RLS
alter table public.league_standings enable row level security;

-- Policies: Public Read, Service Role Write
create policy "Public standings are viewable by everyone." on public.league_standings for select using (true);
create policy "Service role manages standings." on public.league_standings for all using (auth.role() = 'service_role');
