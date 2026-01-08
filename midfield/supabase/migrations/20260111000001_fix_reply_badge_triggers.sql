-- ========================================
-- FIX REPLY BADGE TRIGGERS
-- ========================================
-- Bugs Fixed:
-- 1. Badges awarded to ROOT post author instead of PARENT post author
-- 2. Hat-Trick counted globally instead of per-post
--
-- Example:
-- - User A posts (root)
-- - User B replies to A
-- - User C replies to B's reply
-- 
-- OLD (broken): Badges awarded to User A (root)
-- NEW (correct): Badges awarded to User B (parent - the one being replied to)
--
-- Regista: First reply received globally (on any of your posts)
-- Hat-Trick: 3 replies received on THE SAME POST

-- ========================================
-- FIX: REGISTA BADGE (First Reply Received)
-- ========================================

DROP TRIGGER IF EXISTS on_reply_regista ON public.posts;
DROP FUNCTION IF EXISTS handle_regista_badge();

CREATE OR REPLACE FUNCTION public.handle_regista_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    parent_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    -- Only process replies
    IF NEW.parent_post_id IS NULL THEN 
        RETURN NEW; 
    END IF;
    
    -- Get the PARENT post author (the person being replied to)
    SELECT author_id INTO parent_author_id
    FROM public.posts
    WHERE id = NEW.parent_post_id;
    
    -- Don't award badge for self-replies
    IF parent_author_id IS NULL OR parent_author_id = NEW.author_id THEN 
        RETURN NEW; 
    END IF;
    
    -- Count total replies this author has received across ALL their posts
    -- (includes both direct replies to their root posts AND replies to their replies)
    SELECT count(*) INTO reply_count
    FROM public.posts
    WHERE parent_post_id IN (
        SELECT id FROM public.posts WHERE author_id = parent_author_id
    )
    AND is_deleted = false
    AND author_id != parent_author_id;  -- Exclude self-replies
    
    -- Award Regista badge on FIRST reply received
    IF reply_count = 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (parent_author_id, 'regista')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- Notify user if badge was actually awarded
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (parent_author_id, 'badge_received', badge_record_id, 'regista')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_reply_regista
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)
    EXECUTE FUNCTION public.handle_regista_badge();

-- ========================================
-- FIX: HAT-TRICK BADGE (3 Replies on SAME Post)
-- ========================================

DROP TRIGGER IF EXISTS on_reply_hat_trick ON public.posts;
DROP FUNCTION IF EXISTS handle_hat_trick_badge();

CREATE OR REPLACE FUNCTION public.handle_hat_trick_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    parent_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    -- Only process replies
    IF NEW.parent_post_id IS NULL THEN 
        RETURN NEW; 
    END IF;
    
    -- Get the PARENT post author (the person being replied to)
    SELECT author_id INTO parent_author_id
    FROM public.posts
    WHERE id = NEW.parent_post_id;
    
    -- Don't award badge for self-replies
    IF parent_author_id IS NULL OR parent_author_id = NEW.author_id THEN 
        RETURN NEW; 
    END IF;
    
    -- Count replies to THIS SPECIFIC PARENT POST ONLY (not globally)
    SELECT count(*) INTO reply_count
    FROM public.posts
    WHERE parent_post_id = NEW.parent_post_id
    AND is_deleted = false
    AND author_id != parent_author_id;  -- Exclude self-replies
    
    -- Award Hat-Trick badge when THIS POST reaches 3 replies
    IF reply_count = 3 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (parent_author_id, 'hat-trick')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- Notify user if badge was actually awarded
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (parent_author_id, 'badge_received', badge_record_id, 'hat-trick')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_reply_hat_trick
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)
    EXECUTE FUNCTION public.handle_hat_trick_badge();

