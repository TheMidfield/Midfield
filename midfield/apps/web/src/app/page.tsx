import { TopicCard } from "@/components/TopicCard";
import { Hero } from "@/components/Hero";
import { getTopicsByType } from "@midfield/logic/src/topics";
import { Flame, Shield } from "lucide-react";
import Link from "next/link";

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
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Club Hubs
                    </h2>
                    <Link href="/clubs" className="text-sm font-medium text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                        View All Leagues
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {clubs.map((club) => (
                        <Link
                            key={club.id}
                            href={`/topic/${club.slug}`}
                            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-emerald-900/10 transition-all flex items-center gap-6 group"
                        >
                            <img
                                src={club.metadata.badge_url}
                                alt={club.title}
                                className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
                            />
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{club.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 uppercase">
                                        {club.metadata.leagues?.[0] || "League"}
                                    </span>
                                </div>
                                <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                    Active now
                                </div>
                            </div>
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
