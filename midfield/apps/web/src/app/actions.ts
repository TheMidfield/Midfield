"use server";

import { createClient } from "@/lib/supabase/server";

// Helper: Remove accents/diacritics for normalization
function removeDiacritics(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Helper: Lightweight Levenshtein distance for typos
function getLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// In-memory cache for topics (avoids re-fetching on every keystroke)
let topicsCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

// Fetch all topics for search with caching
async function getAllTopicsForSearch() {
    const now = Date.now();
    if (topicsCache && (now - cacheTimestamp) < CACHE_TTL) {
        return topicsCache;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('topics')
        .select('id, title, slug, type, metadata')
        .eq('is_active', true)
        .order('title', { ascending: true });

    if (error) {
        console.error('Error fetching topics:', error);
        return topicsCache || [];
    }

    topicsCache = data || [];
    cacheTimestamp = now;
    return topicsCache;
}

export async function searchTopics(query: string, type?: string) {
    if (!query || query.length < 2) return [];

    const all = await getAllTopicsForSearch();
    const rawQuery = query.toLowerCase().trim();
    const normalizedQuery = removeDiacritics(rawQuery);
    const queryLen = rawQuery.length;

    // Score each topic
    const scored: { topic: any; score: number }[] = [];

    for (const topic of all) {
        // Early type filter
        if (type && topic.type !== type) continue;

        const rawTitle = topic.title.toLowerCase();
        const normalizedTitle = removeDiacritics(rawTitle);
        let score = 0;

        // 1. Exact full match (highest)
        if (rawTitle === rawQuery || normalizedTitle === normalizedQuery) {
            score = 100;
        }
        // 2. Starts with query (very high - prefix match)
        else if (rawTitle.startsWith(rawQuery) || normalizedTitle.startsWith(normalizedQuery)) {
            score = 95;
        }
        // 3. Word starts with query (high - e.g. "Manchester United" matches "uni")
        else if (rawTitle.split(/\s+/).some(w => w.startsWith(rawQuery)) ||
            normalizedTitle.split(/\s+/).some(w => w.startsWith(normalizedQuery))) {
            score = 85;
        }
        // 4. Contains substring
        else if (rawTitle.includes(rawQuery) || normalizedTitle.includes(normalizedQuery)) {
            score = 75;
        }
        // 5. Fuzzy match (for typos) - more tolerant
        else if (queryLen >= 3) {
            // For short titles, compare directly; for long titles, check each word
            const words = normalizedTitle.split(/\s+/);
            let bestDist = Infinity;

            // Check against each word
            for (const word of words) {
                if (Math.abs(word.length - queryLen) <= 3) {
                    const dist = getLevenshteinDistance(word, normalizedQuery);
                    bestDist = Math.min(bestDist, dist);
                }
            }

            // Also check against full title for multi-word queries
            const fullDist = getLevenshteinDistance(normalizedTitle, normalizedQuery);
            bestDist = Math.min(bestDist, fullDist);

            // Allow up to 40% of query length as errors, minimum 2
            const maxDist = Math.max(2, Math.floor(queryLen * 0.4));
            if (bestDist <= maxDist) {
                score = 60 - bestDist * 5; // Lower score for more errors
            }
        }

        if (score >= 50) {
            scored.push({ topic, score });
        }
    }

    // Sort by score (best first) and take top 8
    const results = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(item => item.topic);

    // Enrich player results with club info
    if (results.length > 0) {
        const playerIds = results.filter((t: any) => t.type === 'player').map((t: any) => t.id);

        if (playerIds.length > 0) {
            const supabase = await createClient();
            const { data: relationships } = await supabase
                .from('topic_relationships')
                .select(`
                    child_topic_id,
                    parent_topic:topics!topic_relationships_parent_topic_id_fkey(
                        id,
                        title,
                        metadata
                    )
                `)
                .in('child_topic_id', playerIds)
                .eq('relationship_type', 'plays_for');

            // Create a map of player ID -> club info
            const clubMap = new Map();
            (relationships || []).forEach((rel: any) => {
                if (rel.parent_topic) {
                    clubMap.set(rel.child_topic_id, {
                        name: rel.parent_topic.title,
                        badge_url: rel.parent_topic.metadata?.badge_url
                    });
                }
            });

            // Enrich results
            return results.map((topic: any) => {
                if (topic.type === 'player' && clubMap.has(topic.id)) {
                    return { ...topic, clubInfo: clubMap.get(topic.id) };
                }
                return topic;
            });
        }
    }

    return results;
}

// ============================================
// POST ACTIONS
// ============================================

import { createPost as createPostDB, getPostsByTopic as getPostsDB } from "@midfield/logic/src/posts";

/**
 * Create a new Take (root-level post) on a topic
 */
export async function createTake(topicId: string, content: string) {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to post' };
    }

    const { data, error } = await supabase
        .from('posts')
        .insert({
            topic_id: topicId,
            author_id: user.id,
            content: content.trim(),
            parent_post_id: null,
            root_post_id: null
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating take:', error);
        return { success: false, error: error.message };
    }

    return { success: true, post: data };
}

/**
 * Create a reply to a Take
 */
export async function createReply(rootPostId: string, parentPostId: string, topicId: string, content: string, replyToId: string | null = null) {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to reply' };
    }

    // Prepare base payload without the optional column
    const basePayload = {
        topic_id: topicId,
        author_id: user.id,
        content: content.trim(),
        parent_post_id: parentPostId,
        root_post_id: rootPostId
    };

    let data, error;

    // OPTION A: If checking reply context, try to insert with the new column
    if (replyToId) {
        const threadedPayload = { ...basePayload, reply_to_post_id: replyToId };

        // Cast to any to avoid TS errors if types are missing the new column
        const res = await supabase
            .from('posts')
            .insert(threadedPayload as any)
            .select()
            .single();

        data = res.data;
        error = res.error;

        // If that failed, assume it might be the missing column and fall back
        if (error) {
            console.warn('Threaded insert failed, retrying plain insert.', error.message);
            // Fallback to base payload
            const retry = await supabase
                .from('posts')
                .insert(basePayload as any)
                .select()
                .single();

            data = retry.data;
            error = retry.error;
        }
    } else {
        // OPTION B: Simple reply, just insert base payload
        const res = await supabase
            .from('posts')
            .insert(basePayload as any)
            .select()
            .single();

        data = res.data;
        error = res.error;
    }

    if (error) {
        console.error('Error creating reply:', error);
        return { success: false, error: `Failed to post reply: ${(error as any).message || 'Unknown error'}` };
    }

    // Increment reply_count on root post manually
    const { data: rootPost } = await supabase.from('posts').select('reply_count').eq('id', rootPostId).single();
    if (rootPost) {
        await supabase
            .from('posts')
            .update({ reply_count: (rootPost.reply_count || 0) + 1 })
            .eq('id', rootPostId);
    }

    return { success: true, post: data };
}

/**
 * Get Takes (root posts) for a topic
 */
export async function getTakes(topicId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users(*)
        `)
        .eq('topic_id', topicId)
        .eq('is_deleted', false)
        .is('parent_post_id', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching takes:', error);
        return [];
    }

    return data || [];
}

/**
 * Get Takes (root posts) for a topic with cursor-based pagination
 * @param topicId - The topic ID to fetch posts for
 * @param options.cursor - The created_at of the last post (for cursor-based pagination)
 * @param options.limit - Number of posts to fetch (default 10)
 * @returns { posts, hasMore, nextCursor }
 */
export async function getTakesPaginated(
    topicId: string,
    options?: { cursor?: string; limit?: number }
) {
    const supabase = await createClient();
    const limit = options?.limit || 10;

    let query = supabase
        .from('posts')
        .select(`
            *,
            author:users(*)
        `)
        .eq('topic_id', topicId)
        .eq('is_deleted', false)
        .is('parent_post_id', null)
        .order('created_at', { ascending: false })
        .limit(limit + 1); // Fetch one extra to check if there's more

    // If cursor provided, get posts older than cursor
    if (options?.cursor) {
        query = query.lt('created_at', options.cursor);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching takes:', error);
        return { posts: [], hasMore: false, nextCursor: null };
    }

    const posts = data || [];
    const hasMore = posts.length > limit;

    // Remove the extra item we fetched for hasMore check
    if (hasMore) {
        posts.pop();
    }

    // Next cursor is the created_at of the last post
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].created_at : null;

    return { posts, hasMore, nextCursor };
}

/**
 * Get replies for a Take
 */
export async function getReplies(rootPostId: string) {
    const supabase = await createClient();

    // Try fetching with threaded context first
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users(*),
            reply_to:reply_to_post_id(
                id,
                content,
                author:users!author_id(username)
            )
        `)
        .eq('root_post_id', rootPostId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

    if (error) {
        // FAILSAFE: If fetching with relation fails (missing column), fetch flat
        console.warn('Failed to fetch threaded replies, falling back to flat fetch:', error.message);
        const { data: flatData, error: flatError } = await supabase
            .from('posts')
            .select(`
                *,
                author:users(*)
            `)
            .eq('root_post_id', rootPostId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (flatError) {
            console.error('Error fetching replies (fallback):', flatError);
            return [];
        }
        return flatData || [];
    }

    return data || [];
}

/**
 * Update a post's content (owner only)
 */
export async function updatePost(postId: string, content: string) {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to edit' };
    }

    // Verify ownership
    const { data: existingPost } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

    if (!existingPost || existingPost.author_id !== user.id) {
        return { success: false, error: 'You can only edit your own posts' };
    }

    const { data, error } = await supabase
        .from('posts')
        .update({
            content: content.trim(),
            updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

    if (error) {
        console.error('Error updating post:', error);
        return { success: false, error: error.message };
    }

    return { success: true, post: data };
}

/**
 * Soft delete a post (owner only) - marks as deleted, doesn't remove from DB
 */
export async function deletePost(postId: string) {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be signed in to delete' };
    }

    // Verify ownership
    const { data: existingPost } = await supabase
        .from('posts')
        .select('author_id, root_post_id')
        .eq('id', postId)
        .single();

    if (!existingPost || existingPost.author_id !== user.id) {
        return { success: false, error: 'You can only delete your own posts' };
    }

    const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', postId);

    if (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: error.message };
    }

    // If this was a reply, decrement reply_count on root post
    if (existingPost.root_post_id) {
        const { data: rootPost } = await supabase
            .from('posts')
            .select('reply_count')
            .eq('id', existingPost.root_post_id)
            .single();

        if (rootPost && (rootPost.reply_count || 0) > 0) {
            await supabase
                .from('posts')
                .update({ reply_count: (rootPost.reply_count || 0) - 1 })
                .eq('id', existingPost.root_post_id);
        }
    }

    return { success: true };
}

// ============================================
// REACTION ACTIONS
// ============================================

export type ReactionType = 'fire' | 'hmm' | 'fair' | 'dead';

/**
 * Toggle a reaction on a post (add if not exists, remove if same type, change if different)
 */
export async function toggleReaction(postId: string, reactionType: ReactionType) {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { action: 'error', reactionType: null, error: 'You must be signed in to react' };
    }

    // Check if user already has a reaction on this post
    const { data: existing } = await supabase
        .from('reactions' as any)
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        if ((existing as any).reaction_type === reactionType) {
            // Same reaction - remove it
            await supabase
                .from('reactions' as any)
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);
            return { action: 'removed', reactionType: null };
        } else {
            // Different reaction - update it
            await supabase
                .from('reactions' as any)
                .update({ reaction_type: reactionType })
                .eq('post_id', postId)
                .eq('user_id', user.id);
            return { action: 'changed', reactionType };
        }
    } else {
        // No existing reaction - add new one
        await supabase
            .from('reactions' as any)
            .insert({
                post_id: postId,
                user_id: user.id,
                reaction_type: reactionType
            });
        return { action: 'added', reactionType };
    }
}

/**
 * Get reaction counts for a post
 */
export async function getReactionCounts(postId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reactions' as any)
        .select('reaction_type')
        .eq('post_id', postId);

    if (error) {
        return { fire: 0, hmm: 0, fair: 0, dead: 0 };
    }

    const counts = { fire: 0, hmm: 0, fair: 0, dead: 0 };
    (data as any[])?.forEach(r => {
        if (r.reaction_type in counts) {
            counts[r.reaction_type as ReactionType]++;
        }
    });

    return counts;
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
