import { FeaturedPlayersInfinite } from "@/components/FeaturedPlayersInfinite";
import { supabase } from "@midfield/logic/src/supabase";
import { Users } from "lucide-react";

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
            {/* Elegant Hero Banner - Single Grid with Visible Gradient Stain */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 border border-slate-200 dark:border-neutral-800/50">
                {/* Single grid with radial gradient mask for greenish stain - MORE VISIBLE */}
                <div
                    className="absolute inset-0 opacity-[0.2] dark:opacity-[0.12]"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgb(100 116 139 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgb(100 116 139 / 0.25) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                        maskImage: `
                            radial-gradient(ellipse 800px 500px at top right, rgb(16 185 129) 0%, transparent 65%),
                            linear-gradient(to right, rgb(100 116 139) 0%, rgb(100 116 139) 100%)
                        `,
                        WebkitMaskImage: `
                            radial-gradient(ellipse 800px 500px at top right, rgb(16 185 129) 0%, transparent 65%),
                            linear-gradient(to right, rgb(100 116 139) 0%, rgb(100 116 139) 100%)
                        `,
                        maskComposite: 'add',
                        WebkitMaskComposite: 'source-over'
                    }}
                ></div>

                {/* Content */}
                <div className="relative px-6 py-10 sm:px-8 sm:py-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        {/* Left: Title & Icon */}
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
                                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
                                    Players & Managers
                                </h1>
                            </div>
                        </div>

                        {/* Right: Stats - Single Row with opaque background */}
                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-100 dark:bg-neutral-800 backdrop-blur-md rounded-md border border-slate-200 dark:border-neutral-700 self-start sm:self-auto">
                            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-2xl font-black text-slate-900 dark:text-neutral-100 tabular-nums leading-none">{playersWithClubs.length}</div>
                            <div className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">Profiles</div>
                        </div>
                    </div>
                </div>
            </div>

            <FeaturedPlayersInfinite players={playersWithClubs} />
        </div>
    );
}
