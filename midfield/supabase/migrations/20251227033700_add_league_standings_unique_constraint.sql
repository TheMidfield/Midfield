ALTER TABLE league_standings ADD COLUMN season text NOT NULL DEFAULT '2024-2025';

ALTER TABLE league_standings 
ADD CONSTRAINT league_standings_league_id_team_id_season_key 
UNIQUE (league_id, team_id, season);
