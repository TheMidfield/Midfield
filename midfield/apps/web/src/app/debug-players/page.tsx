import { createClient } from "@/lib/supabase/server";
import { ALLOWED_LEAGUES } from "@midfield/logic/src/constants";

// Test comment to verify git is working properly
export default async function PlayerDebugPage() {
    const supabase = await createClient();

    const { data: playerRelationships, error } = await supabase
        .from('topics')
        .select(`
            *,
            club_relationship:topic_relationships!topic_relationships_child_topic_id_fkey(
                parent_topic:topics!topic_relationships_parent_topic_id_fkey(
                    id,
                    title,
                    metadata
                )
            )
        `)
        .eq('type', 'player')
        .eq('is_active', true);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const totalPlayers = playerRelationships?.length || 0;

    // Detailed filtering with stats
    const leagueStats: Record<string, number> = {};
    const filteredPlayers = (playerRelationships || [])
        .filter((player: any) => {
            const clubData = player.club_relationship?.find((rel: any) => rel.parent_topic)?.parent_topic;
            const league = clubData?.metadata?.league;

            // Track all leagues
            if (league) {
                leagueStats[league] = (leagueStats[league] || 0) + 1;
            }

            if (!league || typeof league !== 'string') return false;
            return ALLOWED_LEAGUES.includes(league.trim());
        });

    const filteredCount = filteredPlayers.length;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Player Debug Info</h1>

            <div className="space-y-4 bg-slate-100 dark:bg-neutral-800 p-4 rounded">
                <div><strong>Total Players:</strong> {totalPlayers}</div>
                <div><strong>Filtered Players:</strong> {filteredCount}</div>
                <div><strong>Filtered/Total Ratio:</strong> {((filteredCount / totalPlayers) * 100).toFixed(2)}%</div>

                <div>
                    <strong>Allowed Leagues:</strong>
                    <pre className="text-sm mt-2 bg-white dark:bg-neutral-900 p-2 rounded">
                        {JSON.stringify(ALLOWED_LEAGUES, null, 2)}
                    </pre>
                </div>

                <div>
                    <strong>League Distribution (Top 20):</strong>
                    <pre className="text-sm mt-2 bg-white dark:bg-neutral-900 p-2 rounded max-h-96 overflow-auto">
                        {JSON.stringify(
                            Object.entries(leagueStats)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 20)
                                .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}),
                            null,
                            2
                        )}
                    </pre>
                </div>

                <div>
                    <strong>Sample Filtered Players (First 5):</strong>
                    <pre className="text-sm mt-2 bg-white dark:bg-neutral-900 p-2 rounded max-h-96 overflow-auto">
                        {JSON.stringify(
                            filteredPlayers.slice(0, 5).map((p: any) => ({
                                name: p.title,
                                club: p.club_relationship?.find((rel: any) => rel.parent_topic)?.parent_topic?.title,
                                league: p.club_relationship?.find((rel: any) => rel.parent_topic)?.parent_topic?.metadata?.league
                            })),
                            null,
                            2
                        )}
                    </pre>
                </div>
            </div>
        </div>
    );
}
