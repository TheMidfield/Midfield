-- Add fallback columns to fixtures table for robust display
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS home_team_name TEXT,
ADD COLUMN IF NOT EXISTS away_team_name TEXT,
ADD COLUMN IF NOT EXISTS home_team_badge TEXT,
ADD COLUMN IF NOT EXISTS away_team_badge TEXT;

-- Reload schema cache to ensure PostgREST picks up new columns
NOTIFY pgrst, 'reload schema';
