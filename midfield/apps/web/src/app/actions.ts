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
    deletePostLogic,
    getUserPostsPaginatedLogic,
    getBookmarkedPostsPaginatedLogic,
    getPostByIdLogic
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

    if (posts.length === 0) return posts;

    // Fetch ALL reactions for these posts to get counts
    const { data: allReactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type, user_id')
        .in('post_id', posts.map((p: any) => p.id));

    // Calculate reaction counts per post
    const reactionCountsMap = new Map<string, Record<ReactionType, number>>();
    allReactions?.forEach((r: any) => {
        if (!reactionCountsMap.has(r.post_id)) {
            reactionCountsMap.set(r.post_id, { fire: 0, hmm: 0, fair: 0, dead: 0 });
        }
        const counts = reactionCountsMap.get(r.post_id)!;
        if (r.reaction_type in counts) {
            counts[r.reaction_type as ReactionType]++;
        }
    });

    // Get user's reactions
    const { data: { user } } = await supabase.auth.getUser();
    const userReactionMap = new Map<string, ReactionType>();
    if (user) {
        allReactions?.forEach((r: any) => {
            if (r.user_id === user.id) {
                userReactionMap.set(r.post_id, r.reaction_type);
            }
        });
    }

    // Enrich posts with reaction data
    posts.forEach((p: any) => {
        p.reactionCounts = reactionCountsMap.get(p.id) || { fire: 0, hmm: 0, fair: 0, dead: 0 };
        p.userReaction = userReactionMap.get(p.id) || null;
    });

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

    if (result.posts.length === 0) return result;

    // Fetch ALL reactions for these posts to get counts
    const { data: allReactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type, user_id')
        .in('post_id', result.posts.map((p: any) => p.id));

    // Calculate reaction counts per post
    const reactionCountsMap = new Map<string, Record<ReactionType, number>>();
    allReactions?.forEach((r: any) => {
        if (!reactionCountsMap.has(r.post_id)) {
            reactionCountsMap.set(r.post_id, { fire: 0, hmm: 0, fair: 0, dead: 0 });
        }
        const counts = reactionCountsMap.get(r.post_id)!;
        if (r.reaction_type in counts) {
            counts[r.reaction_type as ReactionType]++;
        }
    });

    // Get user's reactions
    const { data: { user } } = await supabase.auth.getUser();
    const userReactionMap = new Map<string, ReactionType>();
    if (user) {
        allReactions?.forEach((r: any) => {
            if (r.user_id === user.id) {
                userReactionMap.set(r.post_id, r.reaction_type);
            }
        });
    }

    // Enrich posts with reaction data
    result.posts.forEach((p: any) => {
        p.reactionCounts = reactionCountsMap.get(p.id) || { fire: 0, hmm: 0, fair: 0, dead: 0 };
        p.userReaction = userReactionMap.get(p.id) || null;
    });

    return result;
}

/**
 * Get replies for a Take
 */
export async function getReplies(rootPostId: string) {
    const supabase = await createClient();
    const replies = await getRepliesLogic(supabase, rootPostId);

    if (replies.length === 0) return replies;

    // Fetch ALL reactions for these replies to get counts
    const { data: allReactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type, user_id')
        .in('post_id', replies.map((p: any) => p.id));

    // Calculate reaction counts per post
    const reactionCountsMap = new Map<string, Record<ReactionType, number>>();
    allReactions?.forEach((r: any) => {
        if (!reactionCountsMap.has(r.post_id)) {
            reactionCountsMap.set(r.post_id, { fire: 0, hmm: 0, fair: 0, dead: 0 });
        }
        const counts = reactionCountsMap.get(r.post_id)!;
        if (r.reaction_type in counts) {
            counts[r.reaction_type as ReactionType]++;
        }
    });

    // Get user's reactions
    const { data: { user } } = await supabase.auth.getUser();
    const userReactionMap = new Map<string, ReactionType>();
    if (user) {
        allReactions?.forEach((r: any) => {
            if (r.user_id === user.id) {
                userReactionMap.set(r.post_id, r.reaction_type);
            }
        });
    }

    // Enrich replies with reaction data
    replies.forEach((p: any) => {
        p.reactionCounts = reactionCountsMap.get(p.id) || { fire: 0, hmm: 0, fair: 0, dead: 0 };
        p.userReaction = userReactionMap.get(p.id) || null;
    });

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

/**
 * Get a single post by ID
 */
export async function getPostById(postId: string) {
    const supabase = await createClient();
    return await getPostByIdLogic(supabase, postId);
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
 * Get user posts (takes) paginated
 */
export async function getUserPostsPaginated(options?: { cursor?: string; limit?: number }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { posts: [], hasMore: false, nextCursor: null };

    const result = await getUserPostsPaginatedLogic(supabase, user.id, options);

    // Enrich with user reaction and bookmark status
    if (result.posts.length > 0) {
        const [reactionsRes, bookmarksRes] = await Promise.all([
            supabase
                .from('reactions')
                .select('post_id, reaction_type')
                .eq('user_id', user.id)
                .in('post_id', result.posts.map((p: any) => p.id)),
            supabase
                .from('bookmarks')
                .select('post_id')
                .eq('user_id', user.id)
                .in('post_id', result.posts.map((p: any) => p.id))
        ]);

        const reactionMap = new Map(reactionsRes.data?.map((r: any) => [r.post_id, r.reaction_type]) || []);
        const bookmarkSet = new Set(bookmarksRes.data?.map((b: any) => b.post_id) || []);

        result.posts.forEach((p: any) => {
            (p as any).userReaction = reactionMap.get(p.id) || null;
            (p as any).isBookmarked = bookmarkSet.has(p.id);
        });
    }

    return result;
}

/**
 * Get user bookmarks paginated
 */
export async function getBookmarkedPostsPaginated(options?: { cursor?: string; limit?: number }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { posts: [], hasMore: false, nextCursor: null };

    const result = await getBookmarkedPostsPaginatedLogic(supabase, user.id, options);

    if (result.posts.length === 0) return result;

    // Fetch ALL reactions for these posts to get counts
    const { data: allReactions } = await supabase
        .from('reactions')
        .select('post_id, reaction_type, user_id')
        .in('post_id', result.posts.map((p: any) => p.id));

    // Calculate reaction counts per post
    const reactionCountsMap = new Map<string, Record<ReactionType, number>>();
    allReactions?.forEach((r: any) => {
        if (!reactionCountsMap.has(r.post_id)) {
            reactionCountsMap.set(r.post_id, { fire: 0, hmm: 0, fair: 0, dead: 0 });
        }
        const counts = reactionCountsMap.get(r.post_id)!;
        if (r.reaction_type in counts) {
            counts[r.reaction_type as ReactionType]++;
        }
    });

    // Get user's reactions
    const userReactionMap = new Map<string, ReactionType>();
    allReactions?.forEach((r: any) => {
        if (r.user_id === user.id) {
            userReactionMap.set(r.post_id, r.reaction_type);
        }
    });

    // Enrich posts with reaction data
    result.posts.forEach((p: any) => {
        p.reactionCounts = reactionCountsMap.get(p.id) || { fire: 0, hmm: 0, fair: 0, dead: 0 };
        p.userReaction = userReactionMap.get(p.id) || null;
        p.isBookmarked = true;
    });

    return result;
}
