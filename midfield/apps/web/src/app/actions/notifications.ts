"use server";

import { createClient } from "@/lib/supabase/server";

export type NotificationType = 'reply' | 'upvote' | 'badge_received' | 'system_welcome';

export interface Notification {
    id: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
    resource_id?: string;      // The post ID for reply/upvote notifications
    resource_slug?: string;    // The topic slug
    actor?: {
        username: string;
        avatar_url: string | null;
    } | null;
    badge_id?: string;
    entity?: {
        title: string;
        type: 'player' | 'club' | 'league';
        imageUrl: string | null;
    } | null;
}

/**
 * Get paginated notifications for the current user
 * Only fetches recent notifications (limit enforced for performance)
 */
export async function getNotifications(offset: number = 0, limit: number = 15) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { notifications: [], count: 0, hasMore: false };

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
        return { notifications: [], count: 0, hasMore: false };
    }

    // Enrich notifications with entity data
    const notifications = await Promise.all(data.map(async (n: any) => {
        // Badge enrichment
        if (n.type === 'badge_received' && n.resource_id) {
            const { data: badge } = await supabase
                .from('user_badges')
                .select('badge_id')
                .eq('id', n.resource_id)
                .single();
            if (badge) {
                return { ...n, badge_id: badge.badge_id };
            }
        }

        // Entity enrichment for reply/upvote (resource_slug is the topic slug)
        if ((n.type === 'reply' || n.type === 'upvote') && n.resource_slug) {
            const { data: topic } = await supabase
                .from('topics')
                .select('title, type, metadata')
                .eq('slug', n.resource_slug)
                .single();

            if (topic) {
                const metadata = topic.metadata as any;
                let imageUrl: string | null = null;
                if (topic.type === 'player') {
                    imageUrl = metadata?.photo_url || null;
                } else if (topic.type === 'club') {
                    imageUrl = metadata?.badge_url || metadata?.logo_url || null;
                } else if (topic.type === 'league') {
                    imageUrl = metadata?.logo_url || null;
                }

                return {
                    ...n,
                    entity: {
                        title: topic.title,
                        type: topic.type,
                        imageUrl
                    }
                };
            }
        }

        return n;
    }));

    const hasMore = (count || 0) > offset + limit;

    return { notifications, count: count || 0, hasMore };
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

/**
 * Delete old notifications (>30 days)
 * Called by scheduled job
 */
export async function purgeOldNotifications() {
    const supabase = await createClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) {
        console.error('Error purging old notifications:', error);
        return { success: false };
    }

    return { success: true };
}
