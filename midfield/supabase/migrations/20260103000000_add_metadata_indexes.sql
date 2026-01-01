-- Add UNIQUE index for efficient upserts and data integrity
-- This allows ON CONFLICT ((metadata->'external'->>'thesportsdb_id'), type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_topics_type_tsdb_id 
ON public.topics (type, ((metadata->'external'->>'thesportsdb_id')));

-- Add GIN/Expression indexes for frequent metadata lookups
-- Accelerates .filter('metadata->>league', 'eq', ...) queries
CREATE INDEX IF NOT EXISTS idx_topics_metadata_league 
ON public.topics ((metadata->>'league'));

-- Accelerates player position filtering
CREATE INDEX IF NOT EXISTS idx_topics_metadata_position 
ON public.topics ((metadata->>'position'));
