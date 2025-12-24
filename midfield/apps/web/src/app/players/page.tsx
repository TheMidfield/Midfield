import { FeaturedPlayersInfinite } from "@/components/FeaturedPlayersInfinite";
import { supabase } from "@midfield/logic/src/supabase";
import { Users, TrendingUp } from "lucide-react";

export default async function PlayersPage() {
    // Fetch ALL players (we'll handle pagination on client)
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
        .eq('is_active', true);

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
            {/* Elegant Hero Banner */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-black dark:via-neutral-950 dark:to-black border border-slate-800/50 dark:border-neutral-800/30">
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Content */}
                <div className="relative px-6 py-10 sm:px-8 sm:py-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        {/* Left: Title & Icon */}
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                                    Players & Managers
                                </h1>
                                <p className="text-sm sm:text-base text-slate-400 font-medium mt-1">
                                    Discover football's key figures
                                </p>
                            </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 self-start sm:self-auto">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <div>
                                <div className="text-2xl font-black text-white tabular-nums leading-none">{playersWithClubs.length}</div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Profiles</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FeaturedPlayersInfinite players={playersWithClubs} />
        </div>
    );
}
