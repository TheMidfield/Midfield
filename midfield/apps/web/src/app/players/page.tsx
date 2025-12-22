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
            <div className="flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <User className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-neutral-100 leading-tight">
                        Players
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-neutral-400 font-medium mt-0.5 sm:mt-1">
                        Discover top talent from around the world
                    </p>
                </div>
            </div>

            <FeaturedPlayers players={playersWithClubs} />
        </div>
    );
}
