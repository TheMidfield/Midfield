"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// SEARCH LOGIC
// ============================================

import { searchTopicsLogic } from "@midfield/logic/src/search";

export async function searchTopics(query: string, type?: string) {
    const supabase = await createClient();
    const topics = await searchTopicsLogic(supabase, query, type);

    if (topics && topics.length > 0) {
        const topicIds = topics.map((t: any) => t.id);
        const { data: voteCounts } = await (supabase as any).rpc('get_topic_vote_counts', {
            topic_ids: topicIds
        });

        if (voteCounts) {
            const voteMap = new Map(voteCounts.map((v: any) => [v.topic_id, { up: v.upvotes, down: v.downvotes }]));
            topics.forEach((t: any) => {
                const votes = voteMap.get(t.id) as any;
                t.upvotes = votes?.up || 0;
                t.downvotes = votes?.down || 0;
            });
        }
    }

    return topics;
}

// ============================================
// POST ACTIONS
// ============================================

// ============================================
// POST ACTIONS
// ============================================

import {
    createTakeLogic,
    createReplyLogic,
    getTakesLogic,
    getTakesPaginatedLogic,
    getRepliesLogic,
    updatePostLogic,
    deletePostLogic
} from "@midfield/logic/src/posts";

/**
 * Create a new Take (root-level post) on a topic
 */
export async function createTake(topicId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to post' };
    }

    if (content.length > 1000) {
        return { success: false, error: 'Take exceeds 1000 character limit' };
    }

    return await createTakeLogic(supabase, topicId, user.id, content);
}

/**
 * Create a reply to a Take
 */
export async function createReply(rootPostId: string, parentPostId: string, topicId: string, content: string, replyToId: string | null = null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to reply' };
    }

    if (content.length > 500) {
        return { success: false, error: 'Reply exceeds 500 character limit' };
    }

    return await createReplyLogic(supabase, topicId, user.id, content, rootPostId, parentPostId, replyToId);
}

/**
 * Get Takes (root posts) for a topic
 */
export async function getTakes(topicId: string) {
    const supabase = await createClient();
    const posts = await getTakesLogic(supabase, topicId);

    // Enrich with user reaction
    const { data: { user } } = await supabase.auth.getUser();
    if (user && posts.length > 0) {
        const { data: reactions } = await supabase
            .from('reactions')
            .select('post_id, reaction_type')
            .eq('user_id', user.id)
            .in('post_id', posts.map((p: any) => p.id));

        if (reactions) {
            const reactionMap = new Map(reactions.map((r: any) => [r.post_id, r.reaction_type]));
            posts.forEach((p: any) => {
                p.userReaction = reactionMap.get(p.id) || null;
            });
        }
    }

    return posts;
}

/**
 * Get TakesPaginated
 */
export async function getTakesPaginated(
    topicId: string,
    options?: { cursor?: string; limit?: number }
) {
    const supabase = await createClient();
    const result = await getTakesPaginatedLogic(supabase, topicId, options);

    // Enrich with user reaction
    const { data: { user } } = await supabase.auth.getUser();
    if (user && result.posts.length > 0) {
        const { data: reactions } = await supabase
            .from('reactions')
            .select('post_id, reaction_type')
            .eq('user_id', user.id)
            .in('post_id', result.posts.map((p: any) => p.id));

        if (reactions) {
            const reactionMap = new Map(reactions.map((r: any) => [r.post_id, r.reaction_type]));
            result.posts.forEach((p: any) => {
                p.userReaction = reactionMap.get(p.id) || null;
            });
        }
    }

    return result;
}

/**
 * Get replies for a Take
 */
export async function getReplies(rootPostId: string) {
    const supabase = await createClient();
    const replies = await getRepliesLogic(supabase, rootPostId);

    // Enrich with user reaction
    const { data: { user } } = await supabase.auth.getUser();
    if (user && replies.length > 0) {
        const { data: reactions } = await supabase
            .from('reactions')
            .select('post_id, reaction_type')
            .eq('user_id', user.id)
            .in('post_id', replies.map((p: any) => p.id));

        if (reactions) {
            const reactionMap = new Map(reactions.map((r: any) => [r.post_id, r.reaction_type]));
            replies.forEach((p: any) => {
                p.userReaction = reactionMap.get(p.id) || null;
            });
        }
    }

    return replies;
}

/**
 * Update a post's content (owner only)
 */
export async function updatePost(postId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to edit' };
    }

    return await updatePostLogic(supabase, postId, user.id, content);
}

/**
 * Soft delete a post (owner only)
 */
export async function deletePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to delete' };
    }

    return await deletePostLogic(supabase, postId, user.id);
}

// ============================================
// REACTION ACTIONS
// ============================================

import { toggleReactionLogic, getReactionCountsLogic, type ReactionType } from "@midfield/logic/src/reactions";
export type { ReactionType };

/**
 * Toggle a reaction on a post
 */
export async function toggleReaction(postId: string, reactionType: ReactionType) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { action: 'error', reactionType: null, error: 'You must be signed in to react' };
    }

    // @ts-ignore
    return await toggleReactionLogic(supabase, postId, user.id, reactionType);
}

/**
 * Get reaction counts for a post
 */
export async function getReactionCounts(postId: string) {
    const supabase = await createClient();
    return await getReactionCountsLogic(supabase, postId);
}

// ============================================
// BOOKMARKS
// ============================================

/**
 * Toggle bookmark on a post
 */
export async function toggleBookmark(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated', isBookmarked: false };
    }

    // Check if bookmark exists
    const { data: existing } = await supabase
        .from('bookmarks' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

    if (existing) {
        // Remove bookmark
        await supabase
            .from('bookmarks' as any)
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);
        return { success: true, isBookmarked: false };
    } else {
        // Add bookmark
        await supabase
            .from('bookmarks' as any)
            .insert({ user_id: user.id, post_id: postId });
        return { success: true, isBookmarked: true };
    }
}

/**
 * Check if a post is bookmarked by current user
 */
export async function isPostBookmarked(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('bookmarks' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

    return !!data;
}

/**
 * Get all bookmarked posts for current user
 */
export async function getBookmarkedPosts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('bookmarks' as any)
        .select(`
            post_id,
            created_at,
            posts:post_id (
                id,
                content,
                created_at,
                author_id,
                topic_id,
                reply_count,
                author:author_id (
                    username,
                    avatar_url
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error || !data) return [];

    // Extract post data
    return data.map((b: any) => b.posts).filter(Boolean);
}

/**
 * Get all takes (root posts) created by current user
 */
export async function getUserPosts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            content,
            created_at,
            author_id,
            topic_id,
            reply_count,
            reaction_count,
            author:author_id (
                username,
                avatar_url,
                favorite_club:favorite_club_id (
                    title,
                    metadata
                )
            )
        `)
        .eq('author_id', user.id)
        .is('reply_to_post_id', null) // Only root takes, not replies
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user posts:", error);
        return [];
    }

    // Enrich with user reaction (though it's their own post, they might have reacted?)
    // Actually standard getTakes logic usually enriches. Let's do it for consistency.
    if (data && data.length > 0) {
        const { data: reactions } = await supabase
            .from('reactions')
            .select('post_id, reaction_type')
            .eq('user_id', user.id)
            .in('post_id', data.map((p: any) => p.id));

        if (reactions) {
            const reactionMap = new Map(reactions.map((r: any) => [r.post_id, r.reaction_type]));
            data.forEach((p: any) => {
                (p as any).userReaction = reactionMap.get(p.id) || null;
            });
        }
    }

    return data;
}
