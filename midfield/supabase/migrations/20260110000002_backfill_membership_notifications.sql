-- Backfill missing notifications for Membership Badges
-- We previously granted 'starting_xi' but forgot to insert the notification.

INSERT INTO public.notifications (recipient_id, type, resource_id, resource_slug)
SELECT 
    ub.user_id,
    'badge_received',
    ub.id,
    ub.badge_id
FROM public.user_badges ub
WHERE ub.badge_id IN ('starting_xi', 'club_100', 'club_1k')
AND NOT EXISTS (
    SELECT 1 FROM public.notifications n 
    WHERE n.recipient_id = ub.user_id 
    AND n.type = 'badge_received' 
    AND n.resource_slug = ub.badge_id
);
