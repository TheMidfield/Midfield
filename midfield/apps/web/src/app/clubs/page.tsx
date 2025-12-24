import { getTopicsByType } from "@midfield/logic/src/topics";
import Link from "next/link";
import { Shield, Grid3x3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function ClubsPage() {
    const clubs = await getTopicsByType('club');

    // Sort clubs alphabetically
    const sortedClubs = clubs.sort((a, b) => a.title.localeCompare(b.title));

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
                                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                                    Clubs
                                </h1>
                                <p className="text-sm sm:text-base text-slate-400 font-medium mt-1">
                                    Browse football clubs from top leagues
                                </p>
                            </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 self-start sm:self-auto">
                            <Grid3x3 className="w-5 h-5 text-emerald-400" />
                            <div>
                                <div className="text-2xl font-black text-white tabular-nums leading-none">{sortedClubs.length}</div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Clubs</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedClubs.map((club: any) => (
                    <Link key={club.id} href={`/topic/${club.slug}`}>
                        <Card variant="interactive" className="p-5 flex items-center gap-4 group h-full">
                            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                                <img
                                    src={club.metadata?.badge_url}
                                    alt={club.title}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                    {club.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <Badge variant="secondary" className="text-[10px] truncate max-w-full">
                                        {club.metadata?.league?.replace(/^(English|Spanish|Italian|German|French)\s/, '') || "League"}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
