
import { supabase } from '../packages/logic/src/supabase';
import { ALLOWED_LEAGUES } from '../packages/logic/src/constants';

async function verifyPlayerCounts() {
    console.log("Verifying Player Counts...");
    console.log("Allowed Leagues:", ALLOWED_LEAGUES);

    const { data: playerRelationships, error } = await supabase
        .from('topics')
        .select(`
            id,
            club_relationship:topic_relationships!topic_relationships_child_topic_id_fkey(
                parent_topic:topics!topic_relationships_parent_topic_id_fkey(
                    metadata
                )
            )
        `)
        .eq('type', 'player')
        .eq('is_active', true);

    if (error) {
        console.error("Error fetching players:", error);
        return;
    }

    const totalInDb = playerRelationships.length;
    let filteredCount = 0;
    const leagueCounts: Record<string, number> = {};

    playerRelationships.forEach((player: any) => {
        const clubData = player.club_relationship?.find((rel: any) => rel.parent_topic)?.parent_topic;
        const league = (clubData?.metadata as any)?.league;

        if (league) {
            leagueCounts[league] = (leagueCounts[league] || 0) + 1;
        } else {
            leagueCounts['Unknown/None'] = (leagueCounts['Unknown/None'] || 0) + 1;
        }

        if (ALLOWED_LEAGUES.includes(league)) {
            filteredCount++;
        }
    });

    console.log("\n--- RESULTS ---");
    console.log(`Total Players in DB: ${totalInDb}`);
    console.log(`Players in Top 5 Leagues (Filtered): ${filteredCount}`);

    console.log("\n--- Breakdown by League ---");
    // Sort logic
    Object.entries(leagueCounts).sort((a, b) => b[1] - a[1]).forEach(([league, count]) => {
        const isAllowed = ALLOWED_LEAGUES.includes(league);
        console.log(`${isAllowed ? '[ALLOWED]' : '[EXCLUDED]'} ${league}: ${count}`);
    });
}

verifyPlayerCounts();
