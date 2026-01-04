-- Retroactively Grant Badges to Existing Users
-- This migration grants badges to users who already met the conditions
-- before the automated triggers were created

-- ========================================
-- 1. STARTING XI - First 11 Users
-- ========================================

DO $$
DECLARE
    user_count INT;
BEGIN
    SELECT count(*) INTO user_count FROM public.users;
    
    -- Grant to all users if we have < 11 total
    IF user_count <= 11 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT id, 'starting_xi'
        FROM public.users
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        RAISE NOTICE 'Granted Starting XI to % users', user_count;
    ELSE
        -- If we have more than 11, grant to the first 11 by created_at
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT id, 'starting_xi'
        FROM public.users
        ORDER BY created_at ASC
        LIMIT 11
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        RAISE NOTICE 'Granted Starting XI to first 11 users (out of %)', user_count;
    END IF;
END $$;

-- ========================================
-- 2. CLUB 100 - First 100 Users
-- ========================================

DO $$
DECLARE
    user_count INT;
BEGIN
    SELECT count(*) INTO user_count FROM public.users;
    
    IF user_count > 11 AND user_count <= 100 THEN
        -- Grant to users 12-100
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT id, 'club_100'
        FROM public.users
        WHERE id NOT IN (
            SELECT user_id FROM public.user_badges WHERE badge_id = 'starting_xi'
        )
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        RAISE NOTICE 'Granted Club 100 to users 12-%', user_count;
    ELSIF user_count > 100 THEN
        -- Grant to users 12-100 specifically
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT id, 'club_100'
        FROM public.users
        ORDER BY created_at ASC
        OFFSET 11 LIMIT 89
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        RAISE NOTICE 'Granted Club 100 to users 12-100';
    END IF;
END $$;

-- ========================================
-- 3. CLUB 1K - First 1000 Users
-- ========================================

DO $$
DECLARE
    user_count INT;
BEGIN
    SELECT count(*) INTO user_count FROM public.users;
    
    IF user_count > 100 AND user_count <= 1000 THEN
        -- Grant to users 101-current
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT id, 'club_1k'
        FROM public.users
        WHERE id NOT IN (
            SELECT user_id FROM public.user_badges 
            WHERE badge_id IN ('starting_xi', 'club_100')
        )
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        RAISE NOTICE 'Granted Club 1k to users 101-%', user_count;
    ELSIF user_count > 1000 THEN
        -- Grant to users 101-1000 specifically
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT id, 'club_1k'
        FROM public.users
        ORDER BY created_at ASC
        OFFSET 100 LIMIT 900
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        RAISE NOTICE 'Granted Club 1k to users 101-1000';
    END IF;
END $$;

-- ========================================
-- 4. PLAYMAKER - First Take on Any Topic
-- ========================================

-- Grant Playmaker to users who were first to post on any topic
INSERT INTO public.user_badges (user_id, badge_id)
SELECT DISTINCT ON (topic_id) author_id, 'playmaker'
FROM public.posts
WHERE parent_post_id IS NULL  -- Only root posts (takes)
AND is_deleted = false
ORDER BY topic_id, created_at ASC
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ========================================
-- 5. CROWD PROVOKER - First Reaction Received
-- ========================================

-- Grant to users who have received at least 1 reaction
INSERT INTO public.user_badges (user_id, badge_id)
SELECT DISTINCT p.author_id, 'crowd_provoker'
FROM public.posts p
JOIN public.reactions r ON r.post_id = p.id
WHERE r.user_id != p.author_id  -- Exclude self-reactions
GROUP BY p.author_id
HAVING count(*) >= 1
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ========================================
-- 6. REGISTA - First Reply Received
-- ========================================

-- Grant to users who have received at least 1 reply
INSERT INTO public.user_badges (user_id, badge_id)
SELECT DISTINCT root.author_id, 'regista'
FROM public.posts root
JOIN public.posts reply ON reply.root_post_id = root.id
WHERE reply.parent_post_id IS NOT NULL  -- Is a reply
AND reply.is_deleted = false
AND reply.author_id != root.author_id  -- Exclude self-replies
GROUP BY root.author_id
HAVING count(*) >= 1
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ========================================
-- 7. HAT-TRICK - 3 Replies Received
-- ========================================

-- Grant to users who have received 3+ replies
INSERT INTO public.user_badges (user_id, badge_id)
SELECT root.author_id, 'hat-trick'
FROM public.posts root
JOIN public.posts reply ON reply.root_post_id = root.id
WHERE reply.parent_post_id IS NOT NULL  -- Is a reply
AND reply.is_deleted = false
AND reply.author_id != root.author_id  -- Exclude self-replies
GROUP BY root.author_id
HAVING count(*) >= 3
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ========================================
-- Create Notifications for Retroactively Granted Badges
-- ========================================

-- This creates notifications for all badges that were just granted
-- (but only for badges created by this migration, not old ones)
DO $$
DECLARE
    badge_record RECORD;
BEGIN
    FOR badge_record IN 
        SELECT id, user_id, badge_id, awarded_at
        FROM public.user_badges
        WHERE awarded_at > NOW() - INTERVAL '1 minute'  -- Only badges from this migration
    LOOP
        -- Create notification
        INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
        VALUES (badge_record.user_id, 'badge_received', badge_record.id, badge_record.badge_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Created notifications for retroactively granted badges';
END $$;
