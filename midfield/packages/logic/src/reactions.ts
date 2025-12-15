import { supabase } from "./supabase";

export type ReactionType = 'fire' | 'hmm' | 'fair' | 'dead';

export interface Reaction {
    id: string;
    post_id: string;
    user_id: string;
    reaction_type: ReactionType;
    created_at: string;
}

// Note: These functions use `as any` because the reactions table
// isn't in the generated Supabase types yet. After running the migration
// and regenerating types, these can be cleaned up.

/**
 * Get reactions for a post
 */
export const getReactionsByPost = async (postId: string): Promise<Reaction[]> => {
    const { data, error } = await (supabase as any)
        .from('reactions')
        .select('*')
        .eq('post_id', postId);

    if (error) {
        console.error('Error fetching reactions:', error);
        return [];
    }

    return data || [];
};

/**
 * Get reaction counts by type for a post
 */
export const getReactionCounts = async (postId: string): Promise<Record<ReactionType, number>> => {
    const { data, error } = await (supabase as any)
        .from('reactions')
        .select('reaction_type')
        .eq('post_id', postId);

    if (error) {
        console.error('Error fetching reaction counts:', error);
        return { fire: 0, hmm: 0, fair: 0, dead: 0 };
    }

    const counts: Record<ReactionType, number> = { fire: 0, hmm: 0, fair: 0, dead: 0 };
    data?.forEach((r: any) => {
        if (r.reaction_type in counts) {
            counts[r.reaction_type as ReactionType]++;
        }
    });

    return counts;
};

/**
 * Get user's reaction on a post (if any)
 */
export const getUserReaction = async (postId: string, userId: string): Promise<Reaction | null> => {
    const { data, error } = await (supabase as any)
        .from('reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (error) {
        // No reaction found is not an error
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching user reaction:', error);
        return null;
    }

    return data;
};

/**
 * Add or update a reaction
 */
export const setReaction = async (
    postId: string,
    userId: string,
    reactionType: ReactionType
): Promise<Reaction | null> => {
    // Upsert: insert or update if exists
    const { data, error } = await (supabase as any)
        .from('reactions')
        .upsert({
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType
        }, {
            onConflict: 'post_id,user_id'
        })
        .select()
        .single();

    if (error) {
        console.error('Error setting reaction:', error);
        return null;
    }

    return data;
};

/**
 * Remove a reaction
 */
export const removeReaction = async (postId: string, userId: string): Promise<boolean> => {
    const { error } = await (supabase as any)
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error removing reaction:', error);
        return false;
    }

    return true;
};
