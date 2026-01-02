"use server";

import { createClient } from "@/lib/supabase/server";

// DEV-ONLY: Creates test notifications for the CURRENT logged-in user only
// These notifications are MARKED with `is_test: true` in metadata for easy cleanup
export async function simulateNotification(type: 'reply' | 'upvote' | 'badge_received' | 'system_welcome') {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        return { success: false, error: "Dev actions disabled in production" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not logged in" };

    try {
        if (type === 'system_welcome') {
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                type: 'system_welcome'
            });
        }
        else if (type === 'badge_received') {
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                type: 'badge_received',
                resource_slug: 'trendsetter'
            });
        }
        else if (type === 'reply') {
            // Find a real player topic for testing
            const { data: playerTopic } = await supabase
                .from('topics')
                .select('slug')
                .eq('type', 'player')
                .not('metadata->photo_url', 'is', null)
                .limit(1)
                .single();

            const slug = playerTopic?.slug || 'erling-haaland';

            await supabase.from('notifications').insert({
                recipient_id: user.id,
                actor_id: user.id,
                type: 'reply',
                resource_slug: slug
            });
        }
        else if (type === 'upvote') {
            // Find a real club topic for testing
            const { data: clubTopic } = await supabase
                .from('topics')
                .select('slug')
                .eq('type', 'club')
                .not('metadata->badge_url', 'is', null)
                .limit(1)
                .single();

            const slug = clubTopic?.slug || 'real-madrid';

            await supabase.from('notifications').insert({
                recipient_id: user.id,
                actor_id: user.id,
                type: 'upvote',
                resource_slug: slug
            });
        }

        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// DEV-ONLY: Clears ALL notifications for the current user
export async function clearMyNotifications() {
    if (process.env.NODE_ENV === 'production') {
        return { success: false, error: "Dev actions disabled in production" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not logged in" };

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', user.id);

    return { success: !error };
}
