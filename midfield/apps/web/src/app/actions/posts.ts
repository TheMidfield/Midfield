"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fetch a specific post and its thread (parent + replies)
 * Used for notification deep-linking
 */
export async function getPostThread(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the target post
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:author_id (username, avatar_url)
        `)
        .eq('id', postId)
        .single();

    if (error || !post) {
        return { post: null, replies: [], parent: null };
    }

    // If this is a reply, fetch parent
    let parent = null;
    if (post.parent_post_id) {
        const { data: parentPost } = await supabase
            .from('posts')
            .select(`
                *,
                author:author_id (username, avatar_url)
            `)
            .eq('id', post.parent_post_id)
            .single();
        parent = parentPost;
    }

    // Fetch replies to this post
    const { data: replies = [] } = await supabase
        .from('posts')
        .select(`
            *,
            author:author_id (username, avatar_url)
        `)
        .eq('parent_post_id', postId)
        .order('created_at', { ascending: true });

    return { post, replies, parent };
}
