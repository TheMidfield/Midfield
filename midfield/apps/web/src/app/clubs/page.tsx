import { getTopicsByType } from "@midfield/logic/src/topics";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function ClubsPage() {
    const clubs = await getTopicsByType('club');

    // Sort clubs alphabetically
    const sortedClubs = clubs.sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="w-full">
            {/* Elegant Hero Banner - Discrete Grid with Greenish Zone */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 border border-slate-200 dark:border-neutral-800/50">
                {/* Base grid pattern */}
                <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]" style={{
                    backgroundImage: `linear-gradient(to right, rgb(100 116 139 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgb(100 116 139 / 0.25) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}></div>

                {/* Greenish grid zone - top right corner */}
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.2] dark:opacity-[0.12]" style={{
                    backgroundImage: `linear-gradient(to right, rgb(16 185 129 / 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgb(16 185 129 / 0.3) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}></div>

                {/* Content */}
                <div className="relative px-6 py-10 sm:px-8 sm:py-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        {/* Left: Title & Icon */}
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
                                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
                                    Clubs
                                </h1>
                            </div>
                        </div>

                        {/* Right: Stats - Single Row with opaque background */}
                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-100 dark:bg-neutral-800 backdrop-blur-md rounded-md border border-slate-200 dark:border-neutral-700 self-start sm:self-auto">
                            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-2xl font-black text-slate-900 dark:text-neutral-100 tabular-nums leading-none">{sortedClubs.length}</div>
                            <div className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">Clubs</div>
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
