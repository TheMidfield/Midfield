import { TopicCard } from "@/components/TopicCard";
import { Hero } from "@/components/Hero";
import { getTopicsByType } from "@midfield/logic/src/topics";
import { Flame, Shield, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function Home() {
    // Fetch real seeded clubs
    const clubs = await getTopicsByType('club');

    // Fetch some top rated players for trending
    const players = (await getTopicsByType('player'))
        .sort((a: any, b: any) => (b.metadata?.rating || 0) - (a.metadata?.rating || 0))
        .slice(0, 4);

    return (
        <div className="w-full">
            <Hero />

            {/* Club Hubs Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Club Hubs
                    </h2>
                    <Link href="/clubs" className="text-sm font-semibold text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        View All Leagues →
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clubs.map((club) => (
                        <Link key={club.id} href={`/topic/${club.slug}`}>
                            <Card variant="interactive" className="p-5 flex items-center gap-4 group">
                                <div className="w-14 h-14 rounded-xl border-2 border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 p-2 flex items-center justify-center shrink-0">
                                    <img
                                        src={club.metadata.badge_url}
                                        alt={club.title}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                        {club.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="secondary" className="text-[10px]">
                                            {club.metadata.leagues?.[0] || "League"}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <Activity className="w-3 h-3" />
                                            <span>Active</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Trending Players Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                        Trending Players
                    </h2>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        Updated hourly
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {players.map((t) => (
                        <TopicCard key={t.id} topic={t} />
                    ))}
                </div>
            </section>
        </div>
    );
}
