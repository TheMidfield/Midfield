-- ============================================================================
-- COMPREHENSIVE FIX: ALL NOTIFICATIONS & BADGES
-- ============================================================================
-- This fixes:
-- 1. Reaction notifications (fire/hmm/fair/dead emojis) - were never firing
-- 2. Reaction badges (Crowd Provoker) - wrong badge + never triggering
-- 3. Reply notifications - wrong column reference
-- 4. Reply badges (Regista, Hat-Trick) - wrong recipient logic
-- 
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: FIX REACTION NOTIFICATIONS & BADGES
-- ============================================================================

DROP TRIGGER IF EXISTS on_reaction_created ON public.reactions;
DROP TRIGGER IF EXISTS on_reaction_crowd_provoker ON public.reactions;

CREATE OR REPLACE FUNCTION public.handle_new_upvote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

        -- 3. Standard reaction notification (all reaction types: fire/hmm/fair/dead)
        INSERT INTO public.notifications (recipient_id, actor_id, resource_id, resource_slug, type)
        VALUES (post_author_id, NEW.user_id, NEW.post_id, topic_slug_val, 'upvote')
        ON CONFLICT (recipient_id, type, resource_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for ALL reactions (no reaction_type filter)
CREATE TRIGGER on_reaction_created
    AFTER INSERT ON public.reactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_upvote();


-- ============================================================================
-- PART 2: FIX REPLY NOTIFICATIONS
-- ============================================================================

DROP TRIGGER IF EXISTS on_reply_created ON public.posts;

CREATE OR REPLACE FUNCTION public.handle_new_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    parent_author_id UUID;
    topic_slug_val TEXT;
BEGIN
    -- Get the author of the parent post (the person being replied to)
    SELECT author_id INTO parent_author_id 
    FROM public.posts 
    WHERE id = COALESCE(NEW.reply_to_post_id, NEW.parent_post_id);

    -- Get topic slug for the notification link
    SELECT slug INTO topic_slug_val 
    FROM public.topics 
    WHERE id = NEW.topic_id;

    -- Only notify if replying to someone else's post
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id THEN
        INSERT INTO public.notifications (recipient_id, actor_id, resource_id, resource_slug, type)
        VALUES (parent_author_id, NEW.author_id, NEW.id, topic_slug_val, 'reply')
        ON CONFLICT (recipient_id, type, resource_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger when parent_post_id is set (not reply_to_post_id)
CREATE TRIGGER on_reply_created
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.parent_post_id IS NOT NULL)
    EXECUTE FUNCTION public.handle_new_reply();


-- ============================================================================
-- PART 3: FIX REPLY BADGES (REGISTA & HAT-TRICK)
-- ============================================================================

DROP TRIGGER IF EXISTS on_reply_regista ON public.posts;
DROP TRIGGER IF EXISTS on_reply_hat_trick ON public.posts;

-- Regista: First reply received (any post)
CREATE OR REPLACE FUNCTION public.handle_regista_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    parent_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    -- Get parent post author
    SELECT author_id INTO parent_author_id 
    FROM public.posts 
    WHERE id = NEW.parent_post_id;

    -- Don't award for self-replies
    IF parent_author_id IS NULL OR parent_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;

    -- Count total replies this user has received across all their posts
    SELECT COUNT(*) INTO reply_count
    FROM public.posts replies
    JOIN public.posts parents ON replies.parent_post_id = parents.id
    WHERE parents.author_id = parent_author_id
      AND replies.author_id != parent_author_id;

    -- Award badge if this is their first reply received
    IF reply_count = 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (parent_author_id, 'regista')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;

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


-- Hat-Trick: 3 replies on same post
CREATE OR REPLACE FUNCTION public.handle_hat_trick_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    parent_author_id UUID;
    reply_count INT;
    badge_record_id UUID;
BEGIN
    -- Get parent post author
    SELECT author_id INTO parent_author_id 
    FROM public.posts 
    WHERE id = NEW.parent_post_id;

    -- Don't award for self-replies
    IF parent_author_id IS NULL OR parent_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;

    -- Count replies on THIS specific post
    SELECT COUNT(*) INTO reply_count
    FROM public.posts
    WHERE parent_post_id = NEW.parent_post_id
      AND author_id != parent_author_id;

    -- Award badge if this post now has exactly 3 replies
    IF reply_count = 3 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (parent_author_id, 'hat-trick')
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;

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

-- ============================================================================
-- DONE! Now test:
-- 1. React with 🔥 to someone's post → they get notification + Crowd Provoker badge
-- 2. Reply to someone's take → they get notification + Regista badge (first reply)
-- 3. 3 different users reply to same post → author gets Hat-Trick badge
-- ============================================================================

