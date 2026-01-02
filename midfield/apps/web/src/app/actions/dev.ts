"use server";

import { createClient } from "@/lib/supabase/server";

export async function simulateNotification(type: 'reply' | 'upvote' | 'badge_received' | 'system_welcome') {
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
            // Use Mbappe for player entity test
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                actor_id: user.id,
                type: 'reply',
                resource_slug: 'kylian-mbappe'
            });
        }
        else if (type === 'upvote') {
            // Use Man City for club entity test
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                actor_id: user.id,
                type: 'upvote',
                resource_slug: 'manchester-city'
            });
        }

        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}
