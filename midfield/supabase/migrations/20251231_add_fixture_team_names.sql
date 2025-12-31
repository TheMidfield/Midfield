-- Add team name fallback columns to fixtures table
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS home_team_name TEXT,
ADD COLUMN IF NOT EXISTS away_team_name TEXT;

-- Add helpful comment
COMMENT ON COLUMN fixtures.home_team_name IS 'Fallback team name from API for display when topic relationship is missing';
COMMENT ON COLUMN fixtures.away_team_name IS 'Fallback team name from API for display when topic relationship is missing';
