import { TopicCard } from "@/components/TopicCard";
import { Hero } from "@/components/Hero";
import { FeaturedPlayers } from "@/components/FeaturedPlayers";
import { getTopicsByType, getLeagues, getClubsByLeague } from "@midfield/logic/src/topics";
import { getRandomFeaturedPlayers } from "@midfield/logic/src/featured";
import { Flame, Shield, Trophy, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// League display info
const LEAGUE_INFO: Record<string, { flag: string; color: string }> = {
    "English Premier League": { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "from-purple-500 to-pink-500" },
    "Spanish La Liga": { flag: "🇪🇸", color: "from-red-500 to-yellow-500" },
    "Italian Serie A": { flag: "🇮🇹", color: "from-blue-500 to-green-500" },
    "German Bundesliga": { flag: "🇩🇪", color: "from-gray-800 to-red-600" },
    "French Ligue 1": { flag: "🇫🇷", color: "from-blue-600 to-red-600" },
};

export default async function Home() {
    // Fetch data concurrently for better performance
    const [leagues, allClubs, playersWithClubs] = await Promise.all([
        getLeagues(),
        getTopicsByType('club'),
        getRandomFeaturedPlayers(10)
    ]);

    // Get 6 featured clubs (2 from each of 3 leagues)
    const featuredClubs = leagues.slice(0, 3).flatMap(league =>
        allClubs.filter((club: any) => club.metadata?.league === league).slice(0, 2)
    ).slice(0, 6);

    return (
        <div className="w-full">
            <Hero />

            {/* Featured Players Section - NOW FIRST */}
            <FeaturedPlayers players={playersWithClubs} />

            {/* Leagues Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        Top Leagues
                    </h2>
                    <Link href="/leagues">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {leagues.map((league) => {
                        const info = LEAGUE_INFO[league];
                        const slug = league.toLowerCase().replace(/\s+/g, '-');

                        return (
                            <Link key={league} href={`/leagues/${slug}`}>
                                <Card variant="interactive" className="group p-4 text-center">
                                    <div className="text-4xl mb-2 transition-transform">
                                        {info?.flag || "🏆"}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                        {league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                    </h3>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Featured Clubs Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Featured Clubs
                    </h2>
                    <Link href="/leagues">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                            Browse by League
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {featuredClubs.map((club: any) => (
                        <Link key={club.id} href={`/topic/${club.slug}`}>
                            <Card variant="interactive" className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 group">
                                <img
                                    src={club.metadata?.badge_url}
                                    alt={club.title}
                                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                        {club.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="secondary" className="text-[10px]">
                                            {club.metadata?.league?.replace(/^(English|Spanish|Italian|German|French)\s/, '') || "League"}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
