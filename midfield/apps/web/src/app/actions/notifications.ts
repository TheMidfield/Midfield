"use server";

import { createClient } from "@/lib/supabase/server";

export type NotificationType = 'reply' | 'upvote' | 'badge_received' | 'system_welcome';

export interface Notification {
    id: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
    resource_id?: string;
    resource_slug?: string;
    actor?: {
        username: string;
        avatar_url: string | null;
    } | null;
    badge_id?: string; // Enriched for badge notifications
}

/**
 * Get paginated notifications for the current user
 */
export async function getNotifications(offset: number = 0, limit: number = 20) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { notifications: [], count: 0 };

    // Fetch notifications with actor details
    const { data, count, error } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:actor_id (
                username,
                avatar_url
            )
        `, { count: 'exact' })
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [], count: 0 };
    }

    // Enrich badge notifications
    const notifications = await Promise.all(data.map(async (n: any) => {
        if (n.type === 'badge_received' && n.resource_id) {
            // Fetch the badge detail from user_badges using the resource_id (which is user_badges.id)
            const { data: badge } = await supabase
                .from('user_badges')
                .select('badge_id')
                .eq('id', n.resource_id)
                .single();

            if (badge) {
                return { ...n, badge_id: badge.badge_id };
            }
        }
        return n;
    }));

    return { notifications, count: count || 0 };
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

    if (error) return 0;
    return count || 0;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('recipient_id', user.id);

    return { success: !error };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

    return { success: !error };
}
