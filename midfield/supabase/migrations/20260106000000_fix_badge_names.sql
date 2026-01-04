-- Fix Badge Naming Issues & Grant Starting XI Badge
-- This migration:
-- 1. Renames badge_ids to match their display titles (fix notification mismatch)
-- 2. Grants Starting XI badge to all existing users if total count < 11
-- 3. Updates the post trigger to use new badge name

-- Step 1: Rename existing badges in user_badges table
UPDATE user_badges SET badge_id = 'playmaker' WHERE badge_id = 'trendsetter';
UPDATE user_badges SET badge_id = 'crowd_provoker' WHERE badge_id = 'playmaker';
UPDATE user_badges SET badge_id = 'regista' WHERE badge_id = 'influencer';

-- Step 2: Update notifications resource_slug to match new badge names
UPDATE notifications 
SET resource_slug = 'playmaker' 
WHERE type = 'badge_received' AND resource_slug = 'trendsetter';

UPDATE notifications 
SET resource_slug = 'crowd_provoker' 
WHERE type = 'badge_received' AND resource_slug = 'playmaker';

UPDATE notifications 
SET resource_slug = 'regista' 
WHERE type = 'badge_received' AND resource_slug = 'influencer';

-- Step 3: Grant Starting XI badge to all current users if we have < 11 users
DO $$
DECLARE
    user_count INT;
BEGIN
    SELECT count(*) INTO user_count FROM public.users;
    
    -- Only grant if we have fewer than 11 users
    IF user_count < 11 THEN
        -- Grant Starting XI to all users who don't have it
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT id, 'starting_xi'
        FROM public.users
        WHERE id NOT IN (
            SELECT user_id FROM public.user_badges WHERE badge_id = 'starting_xi'
        )
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        RAISE NOTICE 'Granted Starting XI badge to % users', user_count;
    ELSE
        RAISE NOTICE 'User count (%) >= 11, skipping Starting XI grant', user_count;
    END IF;
END $$;

-- Step 4: Update the post trigger to use new badge name
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
            VALUES (NEW.author_id, 'badge_received', badge_record_id, 'playmaker');
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

-- Update the user creation trigger to use new badge names
DROP TRIGGER IF EXISTS on_user_profile_created ON public.users;
DROP FUNCTION IF EXISTS on_user_created_welcome();

CREATE OR REPLACE FUNCTION on_user_created_welcome() RETURNS TRIGGER AS $$
DECLARE
    user_count INT;
BEGIN
    -- 1. Create Welcome Notification
    INSERT INTO public.notifications (recipient_id, type)
    VALUES (NEW.id, 'system_welcome');

    -- 2. Check User Count for Badges (approximate)
    SELECT count(*) INTO user_count FROM public.users;

    -- 3. Award Badges (using new names)
    IF user_count <= 11 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.id, 'starting_xi');
    ELSIF user_count <= 100 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.id, 'club_100');
    ELSIF user_count <= 1000 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.id, 'club_1k');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION on_user_created_welcome();
