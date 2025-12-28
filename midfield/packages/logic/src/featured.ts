import { supabase } from "./supabase";

/**
 * Get random featured players with club information.
 * OPTIMIZED: Two-step query to avoid circular reference stack overflow.
 * Step 1: Get players with their data
 * Step 2: Get club relationships separately
 */
export async function getRandomFeaturedPlayers(limit: number = 10) {
    // Step 1: Get players (no nested joins to avoid circular refs)
    const { data: players } = await supabase
        .from('topics')
        .select('id, title, slug, type, image_url, metadata, fc26_data')
        .eq('type', 'player')
        .eq('is_active', true)
        .not('slug', 'is', null)
        .limit(50);

    if (!players || players.length === 0) return [];

    // Step 2: Get club relationships for these players
    const playerIds = players.map(p => p.id);
    const { data: relationships } = await supabase
        .from('topic_relationships')
        .select('child_topic_id, parent_topic_id')
        .in('child_topic_id', playerIds)
        .eq('relationship_type', 'club_player');

    // Step 3: Get unique club IDs and fetch club data
    const clubIds = [...new Set((relationships || []).map(r => r.parent_topic_id))];
    const { data: clubs } = clubIds.length > 0
        ? await supabase
            .from('topics')
            .select('id, title, slug, metadata')
            .in('id', clubIds)
        : { data: [] };

    // Build lookup maps
    const clubMap = new Map((clubs || []).map(c => [c.id, c]));
    const playerToClubMap = new Map((relationships || []).map(r => [r.child_topic_id, r.parent_topic_id]));

    // Process players with club data and randomly select 'limit'
    const playersWithClubs = players.map((player: any) => {
        const clubId = playerToClubMap.get(player.id);
        const club = clubId ? clubMap.get(clubId) : null;
        return {
            ...player,
            clubInfo: club ? {
                name: club.title,
                badge_url: (club.metadata as any)?.badge_url
            } : null
        };
    }).sort(() => Math.random() - 0.5).slice(0, limit);

    return playersWithClubs;
}
