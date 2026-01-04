-- Create triggers to automatically maintain topics.post_count
-- This ensures the count stays accurate as posts are created and deleted

-- Function to increment post_count when a post is created
CREATE OR REPLACE FUNCTION increment_topic_post_count()
RETURNS TRIGGER AS $$
DECLARE
    target_topic_id UUID;
BEGIN
    -- For root posts (Takes), use the post's topic_id directly
    -- For replies, find the topic_id from the root post
    IF NEW.parent_post_id IS NULL THEN
        target_topic_id := NEW.topic_id;
    ELSE
        -- Get topic_id from the root post
        SELECT topic_id INTO target_topic_id
        FROM posts
        WHERE id = NEW.root_post_id;
    END IF;

    -- Increment the count
    IF target_topic_id IS NOT NULL THEN
        UPDATE topics
        SET post_count = post_count + 1
        WHERE id = target_topic_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement post_count when a post is soft-deleted
CREATE OR REPLACE FUNCTION decrement_topic_post_count()
RETURNS TRIGGER AS $$
DECLARE
    target_topic_id UUID;
BEGIN
    -- Only decrement if the post is being marked as deleted
    IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
        -- For root posts, use the post's topic_id directly
        -- For replies, find the topic_id from the root post
        IF OLD.parent_post_id IS NULL THEN
            target_topic_id := OLD.topic_id;
        ELSE
            -- Get topic_id from the root post
            SELECT topic_id INTO target_topic_id
            FROM posts
            WHERE id = OLD.root_post_id;
        END IF;

        -- Decrement the count
        IF target_topic_id IS NOT NULL THEN
            UPDATE topics
            SET post_count = GREATEST(post_count - 1, 0)
            WHERE id = target_topic_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for INSERT (new posts)
DROP TRIGGER IF EXISTS on_post_created_increment_count ON public.posts;
CREATE TRIGGER on_post_created_increment_count
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.is_deleted = false)
    EXECUTE FUNCTION increment_topic_post_count();

-- Create trigger for UPDATE (soft deletes)
DROP TRIGGER IF EXISTS on_post_deleted_decrement_count ON public.posts;
CREATE TRIGGER on_post_deleted_decrement_count
    AFTER UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION decrement_topic_post_count();
