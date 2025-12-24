import { TopicCard } from "@/components/TopicCard";
import { Hero } from "@/components/Hero";
import { FeaturedPlayers } from "@/components/FeaturedPlayers";
import { getTopicsByType } from "@midfield/logic/src/topics";
import { getRandomFeaturedPlayers } from "@midfield/logic/src/featured";
import { supabase } from "@midfield/logic/src/supabase";
import { Flame, Shield, Trophy, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Country flag image mapping
const COUNTRY_FLAG_IMAGES: Record<string, string> = {
    "England": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/england.png",
    "Spain": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/spain.png",
    "Italy": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/italy.png",
    "Germany": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/germany.png",
    "France": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/france.png",
};

export default async function Home() {
    // Fetch leagues from database
    const { data: leagues } = await supabase
        .from('topics')
        .select('*')
        .eq('type', 'league')
        .eq('is_active', true)
        .order('title', { ascending: true });

    // Fetch data concurrently for better performance
    const [allClubs, playersWithClubs] = await Promise.all([
        getTopicsByType('club'),
        getRandomFeaturedPlayers(10)
    ]);

    // Get 6 featured clubs (2 from each of 3 leagues)
    const topLeagues = (leagues || []).slice(0, 3);
    const featuredClubs = topLeagues.flatMap((league: any) =>
        allClubs.filter((club: any) => club.metadata?.league === league.title).slice(0, 2)
    ).slice(0, 6);

    return (
        <div className="w-full">
            <Hero />

            {/* Featured Players Section */}
            <FeaturedPlayers players={playersWithClubs} />

            {/* Featured Clubs Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Featured Clubs
                    </h2>
                    <Link href="/clubs">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                            View All
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
                    {leagues.map((league: any) => {
                        const countryFlagImg = COUNTRY_FLAG_IMAGES[league.metadata?.country || ""];
                        const slug = league.slug;

                        return (
                            <Link key={league.id} href={`/topic/${slug}`}>
                                <Card variant="interactive" className="group p-4 text-center">
                                    <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                                        {league.metadata?.logo_url ? (
                                            <>
                                                <img
                                                    src={league.metadata.logo_url}
                                                    alt={league.title}
                                                    className="max-w-full max-h-full object-contain dark:hidden"
                                                />
                                                <img
                                                    src={league.metadata.logo_url_dark || league.metadata.logo_url}
                                                    alt={league.title}
                                                    className="max-w-full max-h-full object-contain hidden dark:block"
                                                />
                                            </>
                                        ) : countryFlagImg ? (
                                            <img src={countryFlagImg} alt={league.metadata?.country} className="w-10 h-10 object-cover rounded" />
                                        ) : (
                                            <Trophy className="w-10 h-10 text-slate-300 dark:text-neutral-600" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                        {league.title.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                    </h3>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
