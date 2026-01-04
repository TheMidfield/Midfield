-- Ensure Membership Badges Trigger Notifications
-- The previous trigger awarded the badge but didn't notify the user.
-- This update ensures users get a 'badge_received' notification for their membership tier.

CREATE OR REPLACE FUNCTION on_user_created_welcome() RETURNS TRIGGER AS $$
DECLARE
    user_count INT;
    badge_record_id UUID;
    awarded_badge_id TEXT;
BEGIN
    -- 1. Create Welcome Notification
    INSERT INTO public.notifications (recipient_id, type)
    VALUES (NEW.id, 'system_welcome');

    -- 2. Check User Count for Badges (approximate)
    SELECT count(*) INTO user_count FROM public.users;

    -- 3. Award Badges (Mutually Exclusive Tiers)
    -- We capture the inserted ID to link the notification
    IF user_count <= 11 THEN
        awarded_badge_id := 'starting_xi';
    ELSIF user_count <= 100 THEN
        awarded_badge_id := 'club_100';
    ELSIF user_count <= 1000 THEN
        awarded_badge_id := 'club_1k';
    END IF;

    -- 4. Insert Badge & Notification if applicable
    IF awarded_badge_id IS NOT NULL THEN
        -- Insert Badge
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.id, awarded_badge_id)
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING id INTO badge_record_id;

        -- Insert Notification (Only if badge was actually inserted/found)
        -- Note: If ON CONFLICT DO NOTHING triggered, badge_record_id might be null depending on postgres version behavior with returning
        -- So we query it back if needed, but for a NEW user, conflict shouldn't happen essentially.
        
        IF badge_record_id IS NULL THEN
             SELECT id INTO badge_record_id FROM public.user_badges 
             WHERE user_id = NEW.id AND badge_id = awarded_badge_id;
        END IF;

        IF badge_record_id IS NOT NULL THEN
            INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
            VALUES (NEW.id, 'badge_received', badge_record_id, awarded_badge_id)
            ON CONFLICT (recipient_id, type, resource_slug) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (DROP first to avoid duplicates)
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION on_user_created_welcome();
