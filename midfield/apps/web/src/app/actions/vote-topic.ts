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
