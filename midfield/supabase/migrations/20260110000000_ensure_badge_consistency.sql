-- Ensure Badge Consistency & Grant Missing Badges
-- 1. Rename any remaining 'trendsetter' badges to 'playmaker'
-- 2. Grant 'Starting XI' badge to all current users (safety check)
-- 3. Ensure the post trigger uses 'playmaker'

-- Step 1: Fix Legacy Badge Names
UPDATE public.user_badges SET badge_id = 'playmaker' WHERE badge_id = 'trendsetter';

UPDATE public.notifications 
SET resource_slug = 'playmaker' 
WHERE type = 'badge_received' AND resource_slug = 'trendsetter';

-- Step 2: Grant Starting XI to ALL current users (since we confirmed count is 5)
-- We use ON CONFLICT DO NOTHING to avoid duplicates
INSERT INTO public.user_badges (user_id, badge_id)
SELECT id, 'starting_xi'
FROM public.users
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Step 3: Re-define the post trigger to GUARANTEE it uses 'playmaker'
CREATE OR REPLACE FUNCTION handle_post_badges() RETURNS TRIGGER
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
        
        -- Only create notification if badge was actually inserted
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (NEW.author_id, 'badge_received', badge_record_id, 'playmaker')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;
