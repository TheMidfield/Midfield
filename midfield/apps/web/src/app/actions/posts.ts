"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fetch the full thread for a post (used for notification deep-linking)
 * Returns the root post + all replies, with the target post ID for highlighting
 */
export async function getPostThread(targetPostId: string) {
    const supabase = await createClient();

    // Fetch the target post to get its root
    const { data: targetPost, error } = await supabase
        .from('posts')
        .select('id, root_post_id, parent_post_id')
        .eq('id', targetPostId)
        .single();

    if (error || !targetPost) {
        return { rootPost: null, allReplies: [], targetPostId };
    }

    // Find the root post ID (if target is a reply, use root_post_id, else it's the root)
    const rootPostId = targetPost.root_post_id || targetPost.id;

    // Fetch the root post with full details
    const { data: rootPost } = await supabase
        .from('posts')
        .select(`
            *,
            author:author_id (username, avatar_url, favorite_club:topics!favorite_club_id(title, slug, metadata))
        `)
        .eq('id', rootPostId)
        .single();

    if (!rootPost) {
        return { rootPost: null, allReplies: [], targetPostId };
    }

    // Fetch ALL replies to the root post
    const { data: allReplies = [] } = await supabase
        .from('posts')
        .select(`
            *,
            author:author_id (username, avatar_url, favorite_club:topics!favorite_club_id(title, slug, metadata))
        `)
        .eq('root_post_id', rootPostId)
        .order('created_at', { ascending: true });

    return { rootPost, allReplies, targetPostId };
}
