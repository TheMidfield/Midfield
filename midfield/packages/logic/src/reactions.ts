
export type ReactionType = 'fire' | 'hmm' | 'fair' | 'dead';
/**
 * Toggle a reaction on a post (add if not exists, remove if same type, change if different)
 */
export async function toggleReactionLogic(supabase: any, postId: string, userId: string, reactionType: ReactionType) {
    // Check if user already has a reaction on this post
    const { data: existing, error: fetchError } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    // Ignore error 'PGRST116' (JSON object requested, multiple (or no) rows returned) 
    // because .single() errors if 0 rows.
    if (fetchError && fetchError.code !== 'PGRST116') {
        return { success: false, error: fetchError.message };
    }

    if (existing) {
        if (existing.reaction_type === reactionType) {
            // Same reaction - remove it
            const { error: deleteError } = await supabase
                .from('reactions')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);

            if (deleteError) return { success: false, error: deleteError.message };
            return { success: true, action: 'removed', reactionType: null };
        } else {
            // Different reaction - update it
            const { error: updateError } = await supabase
                .from('reactions')
                .update({ reaction_type: reactionType })
                .eq('post_id', postId)
                .eq('user_id', userId);

            if (updateError) return { success: false, error: updateError.message };
            return { success: true, action: 'changed', reactionType };
        }
    } else {
        // No existing reaction - add new one
        const { error: insertError } = await supabase
            .from('reactions')
            .insert({
                post_id: postId,
                user_id: userId,
                reaction_type: reactionType
            });

        if (insertError) return { success: false, error: insertError.message };
        return { success: true, action: 'added', reactionType };
    }
}

/**
 * Get reaction counts for a post
 */
export async function getReactionCountsLogic(supabase: any, postId: string) {
    const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('post_id', postId);

    if (error) {
        return { fire: 0, hmm: 0, fair: 0, dead: 0 };
    }

    const counts = { fire: 0, hmm: 0, fair: 0, dead: 0 };
    (data || []).forEach((r: any) => {
        if (r.reaction_type in counts) {
            // @ts-ignore
            counts[r.reaction_type]++;
        }
    });

    return counts;
}
