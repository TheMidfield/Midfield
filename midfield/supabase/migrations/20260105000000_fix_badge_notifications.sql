-- Fix Badge Notification Issues
-- 1. Prevent duplicate badge notifications using ON CONFLICT
-- 2. Store badge_id in resource_slug for easier frontend access (backward compatible)

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_post_created_badges ON public.posts;
DROP FUNCTION IF EXISTS handle_post_badges();

-- Create improved badge handling function
CREATE OR REPLACE FUNCTION handle_post_badges() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    topic_exists_post_count INT;
    badge_record_id UUID;
BEGIN
    -- Only handle parent posts (non-replies) for Trendsetter
    IF NEW.parent_post_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Count posts for this topic (including the new one)
    SELECT count(*) INTO topic_exists_post_count 
    FROM public.posts 
    WHERE topic_id = NEW.topic_id 
    AND is_deleted = false;
    
    -- Trendsetter Badge: First post on any topic
    IF topic_exists_post_count = 1 THEN
        -- Try to insert badge (ON CONFLICT prevents duplicates)
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.author_id, 'trendsetter')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- Only create notification if badge was actually inserted (not duplicate)
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (NEW.author_id, 'badge_received', badge_record_id, 'trendsetter');
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_post_created_badges
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_post_badges();

-- Fix existing notifications: update resource_slug to match badge_id for consistency
UPDATE public.notifications n
SET resource_slug = ub.badge_id
FROM public.user_badges ub
WHERE n.type = 'badge_received'
AND n.resource_id = ub.id
AND (n.resource_slug IS NULL OR n.resource_slug != ub.badge_id);
