"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Award the Ambassador badge to the current user (First share)
 */
export async function awardAmbassadorBadge() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    // Try to insert the badge
    const { data: badgeInserted, error: badgeError } = await supabase
        .from('user_badges')
        .insert({
            user_id: user.id,
            badge_id: 'ambassador'
        })
        .select()
        .single();

    if (badgeError) {
        // Most likely unique constraint violation (already earned)
        return { success: false };
    }

    if (badgeInserted) {
        // Create notification
        await supabase.from('notifications').insert({
            recipient_id: user.id,
            type: 'badge_received',
            resource_slug: 'ambassador'
        });
        return { success: true };
    }

    return { success: false };
}
