"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function voteTopic(topicId: string, voteType: 'upvote' | 'downvote') {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "You must be logged in to vote" };
    }

    try {
        // Upsert vote (insert or update if exists)
        // Using 'as any' until topic_votes migration is applied and types are regenerated
        const { error: voteError } = await (supabase as any)
            .from('topic_votes')
            .upsert({
                topic_id: topicId,
                user_id: user.id,
                vote_type: voteType,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'topic_id,user_id'
            });

        if (voteError) {
            console.error('Vote error:', voteError);
            return { success: false, error: voteError.message };
        }

        // Get updated vote counts
        const { data: upvotes } = await (supabase as any)
            .from('topic_votes')
            .select('id', { count: 'exact', head: true })
            .eq('topic_id', topicId)
            .eq('vote_type', 'upvote');

        const { data: downvotes } = await (supabase as any)
            .from('topic_votes')
            .select('id', { count: 'exact', head: true })
            .eq('topic_id', topicId)
            .eq('vote_type', 'downvote');

        // Revalidate the page
        revalidatePath(`/topic/[slug]`, 'page');

        return {
            success: true,
            upvoteCount: upvotes?.length ?? 0,
            downvoteCount: downvotes?.length ?? 0,
        };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function getTopicVotes(topicId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [upvoteRes, downvoteRes, userVoteRes] = await Promise.all([
        (supabase as any).from('topic_votes').select('*', { count: 'exact', head: true }).eq('topic_id', topicId).eq('vote_type', 'upvote'),
        (supabase as any).from('topic_votes').select('*', { count: 'exact', head: true }).eq('topic_id', topicId).eq('vote_type', 'downvote'),
        user ? (supabase as any).from('topic_votes').select('vote_type').eq('topic_id', topicId).eq('user_id', user.id).single() : Promise.resolve({ data: null })
    ]);

    return {
        upvoteCount: upvoteRes.count || 0,
        downvoteCount: downvoteRes.count || 0,
        userVote: (userVoteRes.data?.vote_type as 'upvote' | 'downvote' | null) || null
    };
}
