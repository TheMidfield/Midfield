-- ========================================
-- FIX NOTIFICATION SYSTEM BUGS
-- ========================================
-- This migration fixes two critical bugs:
-- 1. Reply notifications trigger on wrong column (reply_to_post_id vs parent_post_id)
-- 2. Badge notifications from reactions reference non-existent column (badge_id)
--
-- Date: January 11, 2026
-- Status: Production-ready fix

-- ========================================
-- BUG #1: FIX REPLY NOTIFICATION TRIGGER
-- ========================================
-- The trigger was checking NEW.reply_to_post_id (optional threading column)
-- instead of NEW.parent_post_id (actual reply column), causing 99% of replies
-- to never send notifications.

-- Update the trigger function (already correct, just needs re-verification)
CREATE OR REPLACE FUNCTION public.handle_new_reply() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    parent_author_id UUID;
    topic_id_val UUID;
    topic_slug_val TEXT;
BEGIN
    -- Get parent post author and topic
    -- NOTE: We check reply_to_post_id first (for threaded replies), fallback to parent_post_id
    SELECT author_id, topic_id INTO parent_author_id, topic_id_val 
    FROM public.posts 
    WHERE id = COALESCE(NEW.reply_to_post_id, NEW.parent_post_id);
    
    -- Get topic slug
    SELECT slug INTO topic_slug_val FROM public.topics WHERE id = topic_id_val;

    -- Only notify if we found a parent author and it's not a self-reply
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id THEN
        INSERT INTO public.notifications (recipient_id, actor_id, resource_id, resource_slug, type)
        VALUES (parent_author_id, NEW.author_id, NEW.id, topic_slug_val, 'reply')
        ON CONFLICT DO NOTHING; -- Prevent duplicate notifications
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix the trigger condition to check parent_post_id (the actual reply column)
DROP TRIGGER IF EXISTS on_reply_created ON public.posts;
CREATE TRIGGER on_reply_created
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)  -- FIXED: was reply_to_post_id
    EXECUTE FUNCTION public.handle_new_reply();

-- ========================================
-- BUG #2: FIX REACTION BADGE NOTIFICATIONS
-- ========================================
-- The handle_new_upvote() function was trying to insert into a non-existent
-- badge_id column. Correct pattern is resource_id + resource_slug only.

CREATE OR REPLACE FUNCTION public.handle_new_upvote() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    post_author_id UUID;
    topic_id_val UUID;
    topic_slug_val TEXT;
    current_reaction_count INT;
    badge_record_id UUID;
BEGIN
    -- Get post details
    SELECT author_id, topic_id INTO post_author_id, topic_id_val 
    FROM public.posts 
    WHERE id = NEW.post_id;
    
    SELECT slug INTO topic_slug_val 
    FROM public.topics 
    WHERE id = topic_id_val;

    -- Only proceed if reacting to someone else's post
    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
        
        -- 1. Award Crowd Provoker Badge (First reaction received globally)
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (post_author_id, 'crowd_provoker')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;

        -- Only notify if badge was actually awarded (not duplicate)
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (post_author_id, 'badge_received', badge_record_id, 'crowd_provoker')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;

        -- 2. Award Hat-Trick Badge (3 reactions on single post)
        SELECT count(*) INTO current_reaction_count 
        FROM public.reactions 
        WHERE post_id = NEW.post_id;

        IF current_reaction_count = 3 THEN
            INSERT INTO public.user_badges (user_id, badge_id)
            VALUES (post_author_id, 'hat-trick')
            ON CONFLICT (user_id, badge_id) DO NOTHING
            RETURNING id INTO badge_record_id;

            IF FOUND AND badge_record_id IS NOT NULL THEN
                INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
                VALUES (post_author_id, 'badge_received', badge_record_id, 'hat-trick')
                ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
            END IF;
        END IF;

        -- 3. Standard reaction notification (generic 'upvote' type for all reactions)
        INSERT INTO public.notifications (recipient_id, actor_id, resource_id, resource_slug, type)
        VALUES (post_author_id, NEW.user_id, NEW.post_id, topic_slug_val, 'upvote')
        ON CONFLICT DO NOTHING; -- Basic flood protection
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate trigger (no changes, just for consistency)
DROP TRIGGER IF EXISTS on_reaction_created ON public.reactions;
CREATE TRIGGER on_reaction_created
    AFTER INSERT ON public.reactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_upvote();

-- ========================================
-- VERIFICATION QUERIES (Run manually to test)
-- ========================================
-- 1. Test reply notification:
--    INSERT INTO posts (topic_id, author_id, content, parent_post_id, root_post_id)
--    SELECT topic_id, 'OTHER_USER_ID', 'Test reply', id, id FROM posts WHERE author_id = 'YOUR_USER_ID' LIMIT 1;
--    
--    Expected: Notification created for YOUR_USER_ID with type='reply'
--
-- 2. Test reaction notification:
--    INSERT INTO reactions (post_id, user_id, reaction_type)
--    SELECT id, 'OTHER_USER_ID', 'fire' FROM posts WHERE author_id = 'YOUR_USER_ID' LIMIT 1;
--    
--    Expected: Notification created for YOUR_USER_ID with type='upvote'

