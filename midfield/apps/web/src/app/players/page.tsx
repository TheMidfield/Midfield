import { FeaturedPlayers } from "@/components/FeaturedPlayers";
import { supabase } from "@midfield/logic/src/supabase";
import { User, Search } from "lucide-react";


export default async function PlayersPage() {
    // Fetch random players WITH their club information via relationships
    const { data: playerRelationships } = await supabase
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
        .eq('is_active', true)
        .limit(100); // Fetch more players for the dedicated page

    // Process players with club data
    const playersWithClubs = (playerRelationships || []).map((player: any) => {
        const clubData = player.club_relationship?.find((rel: any) => rel.parent_topic)?.parent_topic;
        return {
            ...player,
            clubInfo: clubData ? {
                name: clubData.title,
                badge_url: clubData.metadata?.badge_url
            } : null
        };
    }).sort(() => Math.random() - 0.5); // Randomize order

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
                        Players
                    </h1>
                    <p className="text-slate-500 dark:text-neutral-400 font-medium mt-1">
                        Discover top talent from around the world
                    </p>
                </div>
            </div>

            <FeaturedPlayers players={playersWithClubs} />
        </div>
    );
}
