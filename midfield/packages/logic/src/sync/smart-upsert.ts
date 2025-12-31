
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@midfield/types';

type TopicInsert = Database['public']['Tables']['topics']['Insert'];
type TopicRelationshipInsert = Database['public']['Tables']['topic_relationships']['Insert'];

/**
 * Smart Upsert for Topics
 * - If exists: Updates metadata/title but PRESERVES existing ID and Slug.
 * - If new: Inserts with generated Slug.
 */
export async function smartUpsertTopic(
    supabase: SupabaseClient<Database>,
    topic: TopicInsert,
    type: string,
    thesportsdbId: string
) {
    // 1. Check existence by JSONB query (metadata->external->thesportsdb_id)
    const { data: existing } = await supabase
        .from('topics')
        .select('id, slug, metadata, fc26_data, follower_count, post_count')
        .eq('type', type)
        .filter('metadata->external->>thesportsdb_id', 'eq', thesportsdbId)
        .maybeSingle();

    if (existing) {
        // UPDATE: Merge metadata to preserve enriched fields (height, weight, etc.)
        const existingMetadata = (existing.metadata || {}) as Record<string, any>;
        const newMetadata = (topic.metadata || {}) as Record<string, any>;

        // Merge: New values overwrite existing, but missing keys are preserved
        const mergedMetadata = {
            ...existingMetadata,
            ...newMetadata,
            // Deep overwrite only the "external" object to keep it clean
            external: {
                ...(existingMetadata.external || {}),
                ...(newMetadata.external || {})
            }
        };

        // Exclude slug and protected root-level columns from update
        const {
            slug,
            id,
            follower_count,
            post_count,
            fc26_data,
            thesportsdb_id,
            ...updatePayload
        } = topic as any;

        return await supabase
            .from('topics')
            .update({
                ...updatePayload,
                metadata: mergedMetadata
            })
            .eq('id', existing.id)
            .select()
            .single();
    } else {
        // INSERT: Use the provided payload
        return await supabase
            .from('topics')
            .insert(topic)
            .select()
            .single();
    }
}

/**
 * Smart Relationship Sync (Handles Transfers)
 * - Checks for active 'plays_for' relationship.
 * - If exists and different club: Closes old one (valid_until=now), Opens new one.
 * - If exists and same club: Do nothing.
 * - If new: Opens new one.
 */
export async function syncPlayerForClub(
    supabase: SupabaseClient<Database>,
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
            // Already on this club. No-op.
            return { status: 'unchanged' };
        } else {
            // TRANSFER DETECTED!
            // a. Close old relationship
            await supabase
                .from('topic_relationships')
                .update({ valid_until: now })
                .eq('id', currentRel.id);

            // b. Create new relationship (fall through to insert)
        }
    }

    // Insert new active relationship
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
