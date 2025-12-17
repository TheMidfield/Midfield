"use server";

import { getAllTopics } from "@midfield/logic/src/topics";

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

export async function searchTopics(query: string, type?: string) {
    if (!query || query.length < 2) return [];

    const all = await getAllTopics();

    // Normalize query once
    const rawQuery = query.toLowerCase();
    const normalizedQuery = removeDiacritics(rawQuery);

    // Performance: Filter & Map in one pass to avoid heavy calcs on everything
    // We'll return an object with { topic, score } then sort
    const results = all
        .map(topic => {
            // 0. Filter by type immediately if specified
            if (type && topic.type !== type) return { topic, score: 0 };

            const rawTitle = topic.title.toLowerCase();
            const normalizedTitle = removeDiacritics(rawTitle);

            // 1. Exact Substring Match (Highest Priority)
            if (rawTitle.includes(rawQuery)) {
                // Boost exact full matches
                return { topic, score: rawTitle === rawQuery ? 100 : 90 };
            }

            // 2. Normalized (Accent-insensitive) Match
            if (normalizedTitle.includes(normalizedQuery)) {
                return { topic, score: 80 };
            }

            // 3. Fuzzy / Typo Match (Only if query is long enough to justify fuzzy)
            if (query.length >= 3) {
                const dist = getLevenshteinDistance(normalizedTitle, normalizedQuery);
                const maxDist = Math.floor(query.length * 0.3);
                if (dist <= 2 || dist <= maxDist) {
                    return { topic, score: 70 - dist };
                }
            }

            return { topic, score: 0 };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.topic)
        .slice(0, 5);

    // Enrich player results with club info
    if (results.length > 0) {
        const { supabase } = await import("@midfield/logic/src/supabase");
        const playerIds = results.filter((t: any) => t.type === 'player').map((t: any) => t.id);

        if (playerIds.length > 0) {
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
import { createClient } from "@/lib/supabase/server";

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
