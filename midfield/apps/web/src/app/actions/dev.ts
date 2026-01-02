"use server";

import { createClient } from "@/lib/supabase/server";

export async function simulateNotification(type: 'reply' | 'upvote' | 'badge_received' | 'system_welcome') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not logged in" };

    try {
        if (type === 'system_welcome') {
            // Simulate welcome (usually triggered by DB, but we force one here)
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                type: 'system_welcome'
            });
        }
        else if (type === 'badge_received') {
            // Find a badge to award (or mock one)
            // Just inserting a notification pointing to a fake badge or existing one
            // Let's create a visual mock notification without actual badge record for safety if checking constraints
            // OR find an existing badge.

            // Allow duplicate badges for testing? Constraint might fail. 
            // Let's just mock the notification directly.
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                type: 'badge_received',
                resource_slug: 'trendsetter' // Hardcoded name for test
            });
        }
        else if (type === 'reply') {
            // Simulate a reply from a random user (or self if no others, but filtered by generic logic usually)
            // We just override actor_id to be self for testing, even if UI says "You replied to yourself"
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                actor_id: user.id, // Notification from self for testing
                type: 'reply',
                resource_slug: 'generic-topic'
            });
        }
        else if (type === 'upvote') {
            await supabase.from('notifications').insert({
                recipient_id: user.id,
                actor_id: user.id,
                type: 'upvote',
                resource_slug: 'generic-topic'
            });
        }

        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}
