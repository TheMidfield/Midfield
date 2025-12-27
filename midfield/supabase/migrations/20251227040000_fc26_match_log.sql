-- Create table for tracking FC26 player matching logs
CREATE TABLE IF NOT EXISTS public.player_match_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    sofifa_name TEXT NOT NULL,
    sofifa_id TEXT,
    match_confidence FLOAT CHECK (match_confidence >= 0 AND match_confidence <= 1),
    match_method TEXT CHECK (match_method IN ('id', 'exact_team', 'fuzzy_team', 'global', 'failed')),
    match_details JSONB, -- Store matching scores breakdown
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_match_log_player ON public.player_match_log(player_id);
CREATE INDEX IF NOT EXISTS idx_player_match_log_confidence ON public.player_match_log(match_confidence);
CREATE INDEX IF NOT EXISTS idx_player_match_log_method ON public.player_match_log(match_method);

-- RLS Policies
ALTER TABLE public.player_match_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.player_match_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
