-- Add index on topics.type for faster filtering
CREATE INDEX IF NOT EXISTS idx_topics_type ON public.topics (type);

-- Optional: Add index on topics.is_active if frequently filtered
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON public.topics (is_active);

-- Add B-tree index on metadata->'external'->>'thesportsdb_id' for JSONB queries
CREATE INDEX IF NOT EXISTS idx_topics_metadata_thesportsdb_id ON public.topics ((metadata->'external'->>'thesportsdb_id'));
