
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

/**
 * Smart Upsert for Topics
 */
export async function smartUpsertTopic(
    supabase: SupabaseClient,
    topic: any, // Using any for Deno/JS flexibility or define TopicInsert interface
    type: string,
    thesportsdbId: string
) {
    // 1. Check existence by composite key
    const { data: existing } = await supabase
        .from('topics')
        .select('id, slug')
        .eq('type', type)
        .eq('thesportsdb_id', thesportsdbId)
        .maybeSingle();

    if (existing) {
        // UPDATE: Exclude slug and id
        const { slug, id, ...updatePayload } = topic;

        // Safety check: ensure we aren't accidentally clearing critical fields
        if (!updatePayload.title) delete updatePayload.title;

        return await supabase
            .from('topics')
            .update(updatePayload)
            .eq('id', existing.id)
            .select()
            .single();
    } else {
        // INSERT
        return await supabase
            .from('topics')
            .insert(topic)
            .select()
            .single();
    }
}

/**
 * Smart Relationship Sync
 */
export async function syncPlayerForClub(
    supabase: SupabaseClient,
    playerId: string,
    clubId: string
) {
    const now = new Date().toISOString();

    // 1. Find ACTIVE plays_for relationship
    const { data: currentRel } = await supabase
        .from('topic_relationships')
        .select('id, parent_topic_id')
        .eq('child_topic_id', playerId)
        .eq('relationship_type', 'plays_for')
        .is('valid_until', null)
        .maybeSingle();

    if (currentRel) {
        if (currentRel.parent_topic_id === clubId) {
            return { status: 'unchanged' };
        } else {
            // PROPER TRANSFER HISTORY
            await supabase
                .from('topic_relationships')
                .update({ valid_until: now })
                .eq('id', currentRel.id);
        }
    }

    return await supabase
        .from('topic_relationships')
        .insert({
            parent_topic_id: clubId,
            child_topic_id: playerId,
            relationship_type: 'plays_for',
            valid_from: now
        })
        .select()
        .single();
}
