-- Fix Badge Notification Duplication Issues
-- This migration fixes two critical issues:
-- 1. handle_badge_received() creates duplicate notifications
-- 2. Both individual badge triggers AND on_badge_awarded create notifications (double notifications!)

-- ========================================
-- SOLUTION: Remove the old on_badge_awarded trigger
-- ========================================

-- The individual badge triggers (playmaker, crowd_provoker, etc.) already
-- create notifications via the IF FOUND pattern. We don't need a separate
-- trigger on user_badges table that creates notifications for EVERY insert.

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_badge_awarded ON public.user_badges;
DROP FUNCTION IF EXISTS handle_badge_received();

-- ========================================
-- Add safety: Unique constraint on notifications
-- ========================================

-- Prevent duplicate badge notifications at DB level
-- A user should only get ONE notification per badge
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_badge_notifications
ON public.notifications (recipient_id, type, resource_slug)
WHERE type = 'badge_received';

-- Note: This allows the same user to get multiple badge notifications
-- (different resource_slug), but prevents duplicate notifications for 
-- the SAME badge (same resource_slug).

-- ========================================
-- Update all badge triggers to use resource_slug
-- ========================================

-- Make sure the notification insert includes resource_slug for the unique index
-- The new triggers already do this, but let's verify the playmaker trigger does too:

DROP TRIGGER IF EXISTS on_post_created_badges ON public.posts;
DROP FUNCTION IF EXISTS handle_post_badges();

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
    
    -- Playmaker Badge: First post on any topic (renamed from trendsetter)
    IF topic_exists_post_count = 1 THEN
        -- Try to insert badge (ON CONFLICT prevents duplicates)
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.author_id, 'playmaker')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        -- Only create notification if badge was actually inserted (not duplicate)
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (NEW.author_id, 'badge_received', badge_record_id, 'playmaker')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_created_badges
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_post_badges();

-- ========================================
-- Update reaction/reply triggers to include ON CONFLICT
-- ========================================

-- Crowd Provoker
DROP TRIGGER IF EXISTS on_reaction_crowd_provoker ON public.reactions;
DROP FUNCTION IF EXISTS handle_crowd_provoker_badge();

CREATE OR REPLACE FUNCTION handle_crowd_provoker_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    post_author_id UUID;
    reaction_count INT;
    badge_record_id UUID;
BEGIN
    SELECT author_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
    IF post_author_id = NEW.user_id THEN RETURN NEW; END IF;
    
    SELECT count(*) INTO reaction_count
    FROM public.reactions r JOIN public.posts p ON r.post_id = p.id
    WHERE p.author_id = post_author_id;
    
    IF reaction_count = 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (post_author_id, 'crowd_provoker')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (post_author_id, 'badge_received', badge_record_id, 'crowd_provoker')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_reaction_crowd_provoker
    AFTER INSERT ON public.reactions FOR EACH ROW
    EXECUTE FUNCTION handle_crowd_provoker_badge();

-- Regista
DROP TRIGGER IF EXISTS on_reply_regista ON public.posts;
DROP FUNCTION IF EXISTS handle_regista_badge();

CREATE OR REPLACE FUNCTION handle_regista_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    root_post_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    IF NEW.parent_post_id IS NULL THEN RETURN NEW; END IF;
    SELECT author_id INTO root_post_author_id FROM public.posts WHERE id = NEW.root_post_id;
    IF root_post_author_id = NEW.author_id THEN RETURN NEW; END IF;
    
    SELECT count(*) INTO reply_count
    FROM public.posts replies JOIN public.posts root_posts ON replies.root_post_id = root_posts.id
    WHERE root_posts.author_id = root_post_author_id
    AND replies.parent_post_id IS NOT NULL AND replies.is_deleted = false;
    
    IF reply_count = 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (root_post_author_id, 'regista')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (root_post_author_id, 'badge_received', badge_record_id, 'regista')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_reply_regista
    AFTER INSERT ON public.posts FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)
    EXECUTE FUNCTION handle_regista_badge();

-- Hat-Trick
DROP TRIGGER IF EXISTS on_reply_hat_trick ON public.posts;
DROP FUNCTION IF EXISTS handle_hat_trick_badge();

CREATE OR REPLACE FUNCTION handle_hat_trick_badge() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    root_post_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    IF NEW.parent_post_id IS NULL THEN RETURN NEW; END IF;
    SELECT author_id INTO root_post_author_id FROM public.posts WHERE id = NEW.root_post_id;
    IF root_post_author_id = NEW.author_id THEN RETURN NEW; END IF;
    
    SELECT count(*) INTO reply_count
    FROM public.posts replies JOIN public.posts root_posts ON replies.root_post_id = root_posts.id
    WHERE root_posts.author_id = root_post_author_id
    AND replies.parent_post_id IS NOT NULL AND replies.is_deleted = false;
    
    IF reply_count = 3 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (root_post_author_id, 'hat-trick')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;
        
        IF FOUND AND badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (root_post_author_id, 'badge_received', badge_record_id, 'hat-trick')
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_reply_hat_trick
    AFTER INSERT ON public.posts FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)
    EXECUTE FUNCTION handle_hat_trick_badge();
