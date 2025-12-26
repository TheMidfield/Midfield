import { supabase } from "./supabase";

export async function getRandomFeaturedPlayers(limit: number = 10) {
    const { data: playerRelationships } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            type,
            metadata,
            is_active,
            club_relationship:topic_relationships!topic_relationships_child_topic_id_fkey(
                parent_topic:topics!topic_relationships_parent_topic_id_fkey(
                    id,
                    title,
                    slug,
                    metadata
                )
            )
        `)
        .eq('type', 'player')
        .eq('is_active', true)
        .not('slug', 'is', null)
        .limit(50); // Fetch a larger pool to randomize from

    // Process players with club data and randomly select 'limit'
    const playersWithClubs = (playerRelationships || []).map((player: any) => {
        const clubData = player.club_relationship?.find((rel: any) => rel.parent_topic)?.parent_topic;
        return {
            ...player,
            clubInfo: clubData ? {
                name: clubData.title,
                badge_url: clubData.metadata?.badge_url
            } : null
        };
    }).sort(() => Math.random() - 0.5).slice(0, limit);

    return playersWithClubs;
}
