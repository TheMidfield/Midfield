-- Add fc26_data column for FC26 ratings/stats
ALTER TABLE topics
ADD COLUMN fc26_data JSONB;

-- Create GIN index for efficient JSONB queries
CREATE INDEX idx_topics_fc26_data ON topics USING gin(fc26_data);

-- One-time migration: Move existing metadata.fc26 to fc26_data
UPDATE topics
SET fc26_data = metadata->'fc26'
WHERE metadata ? 'fc26';

-- Optional: Remove fc26 from metadata (comment out if you want to keep it temporarily)
-- UPDATE topics
-- SET metadata = metadata - 'fc26'
-- WHERE metadata ? 'fc26';
