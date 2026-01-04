-- NUCLEAR OPTION: Recreate Badge Logic from Scratch
-- This ensures no stale function definitions exist.

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_post_created_badges ON public.posts;
DROP FUNCTION IF EXISTS public.handle_post_badges();

-- 2. Validate clean slate: Delete any 'trendsetter' badges/notifications if they somehow crept in
DELETE FROM public.user_badges WHERE badge_id = 'trendsetter';
DELETE FROM public.notifications WHERE resource_slug = 'trendsetter';

-- 3. Recreate Function with Explicit 'playmaker' logic
CREATE OR REPLACE FUNCTION public.handle_post_badges() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    topic_exists_post_count INT;
    badge_record_id UUID;
BEGIN
    -- Only handle parent posts (non-replies) for Playmaker badge
    IF NEW.parent_post_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Count posts for this topic (including the new one)
    SELECT count(*) INTO topic_exists_post_count 
    FROM public.posts 
    WHERE topic_id = NEW.topic_id 
    AND is_deleted = false;
    
    -- Playmaker Badge: First post on any topic
    IF topic_exists_post_count = 1 THEN
        -- Try to insert badge
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.author_id, 'playmaker')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- If badge already existed, get its ID
        IF badge_record_id IS NULL THEN
            SELECT id INTO badge_record_id FROM public.user_badges 
            WHERE user_id = NEW.author_id AND badge_id = 'playmaker';
        END IF;

        -- Create notification
        IF badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (NEW.author_id, 'badge_received', badge_record_id, 'playmaker')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Recreate Trigger
CREATE TRIGGER on_post_created_badges
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_post_badges();
