-- Reset all post_count values to 0 since we migrated to a new Supabase project
-- without the legacy takes data
UPDATE topics
SET post_count = 0
WHERE post_count > 0;

-- Verify the update
SELECT COUNT(*) as total_topics, 
       SUM(CASE WHEN post_count = 0 THEN 1 ELSE 0 END) as zero_count,
       SUM(CASE WHEN post_count > 0 THEN 1 ELSE 0 END) as nonzero_count
FROM topics;
