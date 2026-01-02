-- Recalculate and fix all topic post counts
-- This migration corrects any discrepancies in the post_count column
-- Counts both parent posts AND replies for accurate take count

UPDATE topics t
SET post_count = (
    SELECT COUNT(*)
    FROM posts p
    LEFT JOIN posts parent ON p.parent_post_id = parent.id
    WHERE (
        -- Count parent posts directly on this topic
        (p.topic_id = t.id AND p.parent_post_id IS NULL)
        OR
        -- Count replies whose parent belongs to this topic
        (parent.topic_id = t.id AND p.parent_post_id IS NOT NULL)
    )
    AND p.is_deleted = false
)
WHERE t.post_count != (
    SELECT COUNT(*)
    FROM posts p
    LEFT JOIN posts parent ON p.parent_post_id = parent.id
    WHERE (
        (p.topic_id = t.id AND p.parent_post_id IS NULL)
        OR
        (parent.topic_id = t.id AND p.parent_post_id IS NOT NULL)
    )
    AND p.is_deleted = false
);
