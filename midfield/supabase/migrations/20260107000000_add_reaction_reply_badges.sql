-- Create Triggers for Reaction and Reply Badges
-- This migration adds automated badge distribution for:
-- 1. crowd_provoker: First reaction received
-- 2. regista: First reply received  
-- 3. hat-trick: 3 replies received

-- ========================================
-- TRIGGER 1: Crowd Provoker Badge (First Reaction Received)
-- ========================================

CREATE OR REPLACE FUNCTION handle_crowd_provoker_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    post_author_id UUID;
    reaction_count INT;
    badge_record_id UUID;
BEGIN
    -- Get the author of the post being reacted to
    SELECT author_id INTO post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;
    
    -- Don't award badge for self-reactions
    IF post_author_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Count total reactions this author has received (including this new one)
    SELECT count(*) INTO reaction_count
    FROM public.reactions r
    JOIN public.posts p ON r.post_id = p.id
    WHERE p.author_id = post_author_id;
    
    -- Award badge on first reaction received
    IF reaction_count = 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (post_author_id, 'crowd_provoker')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- Create notification if badge was granted
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (post_author_id, 'badge_received', badge_record_id, 'crowd_provoker');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_reaction_crowd_provoker ON public.reactions;
CREATE TRIGGER on_reaction_crowd_provoker
    AFTER INSERT ON public.reactions
    FOR EACH ROW
    EXECUTE FUNCTION handle_crowd_provoker_badge();

-- ========================================
-- TRIGGER 2: Regista Badge (First Reply Received)
-- ========================================

CREATE OR REPLACE FUNCTION handle_regista_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    root_post_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    -- Only process replies (posts with parent_post_id)
    IF NEW.parent_post_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get the author of the root post
    SELECT author_id INTO root_post_author_id
    FROM public.posts
    WHERE id = NEW.root_post_id;
    
    -- Don't award badge for self-replies
    IF root_post_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;
    
    -- Count total replies this author has received across all their posts
    SELECT count(*) INTO reply_count
    FROM public.posts replies
    JOIN public.posts root_posts ON replies.root_post_id = root_posts.id
    WHERE root_posts.author_id = root_post_author_id
    AND replies.parent_post_id IS NOT NULL
    AND replies.is_deleted = false;
    
    -- Award badge on first reply received
    IF reply_count = 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (root_post_author_id, 'regista')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- Create notification if badge was granted
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (root_post_author_id, 'badge_received', badge_record_id, 'regista');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_reply_regista ON public.posts;
CREATE TRIGGER on_reply_regista
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)
    EXECUTE FUNCTION handle_regista_badge();

-- ========================================
-- TRIGGER 3: Hat-Trick Badge (3 Replies Received)
-- ========================================

CREATE OR REPLACE FUNCTION handle_hat_trick_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    root_post_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    -- Only process replies (posts with parent_post_id)
    IF NEW.parent_post_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get the author of the root post
    SELECT author_id INTO root_post_author_id
    FROM public.posts
    WHERE id = NEW.root_post_id;
    
    -- Don't count self-replies
    IF root_post_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;
    
    -- Count total replies this author has received across all their posts
    SELECT count(*) INTO reply_count
    FROM public.posts replies
    JOIN public.posts root_posts ON replies.root_post_id = root_posts.id
    WHERE root_posts.author_id = root_post_author_id
    AND replies.parent_post_id IS NOT NULL
    AND replies.is_deleted = false;
    
    -- Award badge when reaching exactly 3 replies
    IF reply_count = 3 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (root_post_author_id, 'hat-trick')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- Create notification if badge was granted
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (root_post_author_id, 'badge_received', badge_record_id, 'hat-trick');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_reply_hat_trick ON public.posts;
CREATE TRIGGER on_reply_hat_trick
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)
    EXECUTE FUNCTION handle_hat_trick_badge();
