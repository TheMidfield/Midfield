-- Create Notification Type Enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('reply', 'upvote', 'badge_received', 'system_welcome');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Nullable for system
    resource_id UUID, -- Generic ID (Post ID, Badge ID, etc.)
    resource_slug TEXT, -- For direct navigation (e.g. /topic/slug)
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

-- Create User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL, -- 'starting_xi', 'club_100', etc.
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- RLS for User Badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view badges" ON user_badges;
CREATE POLICY "Everyone can view badges" ON user_badges
    FOR SELECT USING (true); 

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- TRIGGER 1: Handle New Reply
CREATE OR REPLACE FUNCTION handle_new_reply() RETURNS TRIGGER AS $$
DECLARE
    parent_author_id UUID;
    topic_id_val UUID;
    topic_slug_val TEXT;
BEGIN
    -- Get parent post author and topic
    SELECT author_id, topic_id INTO parent_author_id, topic_id_val FROM public.posts WHERE id = NEW.reply_to_post_id;
    
    -- Get topic slug
    SELECT slug INTO topic_slug_val FROM public.topics WHERE id = topic_id_val;

    -- Ignore self-replies
    IF parent_author_id != NEW.author_id THEN
        INSERT INTO public.notifications (recipient_id, actor_id, resource_id, resource_slug, type)
        VALUES (parent_author_id, NEW.author_id, NEW.id, topic_slug_val, 'reply');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reply_created ON public.posts;
CREATE TRIGGER on_reply_created
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.reply_to_post_id IS NOT NULL)
    EXECUTE FUNCTION handle_new_reply();

-- TRIGGER 2: Handle Upvote (Reaction)
CREATE OR REPLACE FUNCTION handle_new_upvote() RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    topic_id_val UUID;
    topic_slug_val TEXT;
BEGIN
    IF NEW.reaction_type = 'upvote' THEN
        -- Get post author
        SELECT author_id, topic_id INTO post_author_id, topic_id_val FROM public.posts WHERE id = NEW.post_id;
        
        -- Get topic slug
        SELECT slug INTO topic_slug_val FROM public.topics WHERE id = topic_id_val;

        -- Ignore self-upvotes
        IF post_author_id != NEW.user_id THEN
            -- Check dups could be handled by unique constraint or allow spam. 
            -- For now we allow multiple upvotes to notify if they toggle, unless we use ON CONFLICT.
            -- Let's just insert standard.
            INSERT INTO public.notifications (recipient_id, actor_id, resource_id, resource_slug, type)
            VALUES (post_author_id, NEW.user_id, NEW.post_id, topic_slug_val, 'upvote');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reaction_created ON public.reactions;
CREATE TRIGGER on_reaction_created
    AFTER INSERT ON public.reactions
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_upvote();

-- TRIGGER 3: Handle Badge Received
CREATE OR REPLACE FUNCTION handle_badge_received() RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification but verify if 'badge_received' is valid (it is)
    -- Resource ID is the Badge Record ID (so we can find which badge it is via user_badges selection join or just pass the ID)
    -- Actually resource_id is UUID. user_badges.badge_id is TEXT. 
    -- So we pass user_badges.id (uuid) as resource_id. 
    -- Frontend will fetch user_badges where id = resource_id to get the badge_name/text.
    INSERT INTO public.notifications (recipient_id, resource_id, type)
    VALUES (NEW.user_id, NEW.id, 'badge_received');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_badge_awarded ON public.user_badges;
CREATE TRIGGER on_badge_awarded
    AFTER INSERT ON public.user_badges
    FOR EACH ROW
    EXECUTE FUNCTION handle_badge_received();

-- TRIGGER 4: On User Created (Welcome + Badges)
CREATE OR REPLACE FUNCTION on_user_created_welcome() RETURNS TRIGGER AS $$
DECLARE
    user_count INT;
BEGIN
    -- 1. Create Welcome Notification
    INSERT INTO public.notifications (recipient_id, type)
    VALUES (NEW.id, 'system_welcome');

    -- 2. Check User Count for Badges (approximate)
    -- This relies on auth.users or public.users count.
    SELECT count(*) INTO user_count FROM public.users;

    -- 3. Award Badges
    IF user_count <= 11 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.id, 'starting_xi');
    ELSIF user_count <= 100 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.id, 'club_100');
    ELSIF user_count <= 1000 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.id, 'club_1k');
    ELSIF user_count <= 5000 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.id, 'trendsetter');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_profile_created ON public.users;
CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION on_user_created_welcome();
