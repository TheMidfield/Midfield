-- Recalculate and fix all topic post counts
-- This migration corrects any discrepancies in the post_count column

UPDATE topics t
SET post_count = (
    SELECT COUNT(*)
    FROM posts p
    WHERE p.topic_id = t.id 
    AND p.is_deleted = false
)
WHERE t.post_count != (
    SELECT COUNT(*)
    FROM posts p
    WHERE p.topic_id = t.id 
    AND p.is_deleted = false
);
