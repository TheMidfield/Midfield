import { FeaturedPlayersInfinite } from "@/components/FeaturedPlayersInfinite";
import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";

import { ALLOWED_LEAGUES } from "@midfield/logic/src/constants";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlayersPage() {
    const supabase = await createClient();

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

    // Process players with club data AND filter by allowed leagues
    // CRITICAL: Check ALL relationships using .some(), not just first one
    const filteredPlayers = (playerRelationships || [])
        .filter((player: any) => {
            // Check if ANY of the player's clubs is in an allowed league
            return player.club_relationship?.some((rel: any) => {
                const league = rel.parent_topic?.metadata?.league;
                return league && typeof league === 'string' && ALLOWED_LEAGUES.includes(league.trim());
            }) || false;
        });

    const playersWithClubs = filteredPlayers.map((player: any) => {
        // Prioritize club in allowed league
        const allowedClubRel = player.club_relationship?.find((rel: any) => {
            const league = rel.parent_topic?.metadata?.league;
            return league && ALLOWED_LEAGUES.includes(league);
        });
        const clubData = allowedClubRel?.parent_topic;
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
            {/* Hero Banner - Elegant radial style matching homepage */}
            <section className="relative mb-10 lg:mb-14 pt-4 pb-6 lg:py-8 overflow-visible" style={{ width: '100%' }}>
                {/* Discrete emerald spotlight - top-left corner */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: '-10%',
                        left: '5%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />

                {/* Discrete emerald spotlight - bottom-right corner */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        bottom: '-5%',
                        right: '10%',
                        width: '350px',
                        height: '350px',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
                        filter: 'blur(50px)',
                    }}
                />

                {/* Fading grid background - simple radial mask */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 70%)'
                    }}
                />

                <div className="relative z-10 px-6 py-10 sm:px-8 sm:py-12 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        {/* Left: Title & Icon */}
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
                                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-neutral-100">
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
            </section>

            <FeaturedPlayersInfinite players={playersWithClubs} />
        </div>
    );
}
