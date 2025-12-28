import { Shield, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SplitHero } from "@/components/hero/SplitHero";
import { HomeTrendingSection } from "@/components/hero/HomeTrendingSection";
import { MatchCenterWidget } from "@/components/widgets/MatchCenterWidget";
import { createClient } from "@/lib/supabase/server";
import { getHeroEntities } from "@/app/actions/hero-data";

// =============================================================================
// HOMEPAGE - Using deep clones to avoid RSC serialization issues
// Cache hero data for 1 hour since it's curated static content
// =============================================================================

// Add cache revalidation
export const revalidate = 3600; // 1 hour

const COUNTRY_FLAG_IMAGES: Record<string, string> = {
    "England": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/england.png",
    "Spain": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/spain.png",
    "Italy": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/italy.png",
    "Germany": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/germany.png",
    "France": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/france.png",
};

// Curated high-profile clubs in display order
const FEATURED_CLUB_SLUGS = [
    'real-madrid',
    'manchester-city',
    'arsenal',
    'barcelona',
    'manchester-united',
    'liverpool',
];

type SafeClub = {
    id: string;
    title: string;
    slug: string;
    badgeUrl?: string;
    league?: string;
};

type SafeLeague = {
    id: string;
    title: string;
    slug: string;
    logoUrl?: string;
    logoUrlDark?: string;
    country?: string;
};

export default async function Home() {
    const supabase = await createClient();

    // Fetch curated clubs by slug
    const { data: clubsRaw } = await supabase
        .from('topics')
        .select('id, title, slug, metadata')
        .eq('type', 'club')
        .eq('is_active', true)
        .in('slug', FEATURED_CLUB_SLUGS);

    // Fetch leagues  
    const { data: leaguesRaw } = await supabase
        .from('topics')
        .select('id, title, slug, metadata')
        .eq('type', 'league')
        .eq('is_active', true)
        .order('title', { ascending: true });

    // CRITICAL: Deep clone to break Supabase references, then extract primitives
    const clubsPlain = JSON.parse(JSON.stringify(clubsRaw || []));
    const leaguesPlain = JSON.parse(JSON.stringify(leaguesRaw || []));

    // Sort clubs by our curated order
    const featuredClubs: SafeClub[] = FEATURED_CLUB_SLUGS
        .map(slug => clubsPlain.find((c: any) => c.slug === slug))
        .filter(Boolean)
        .map((c: any) => ({
            id: String(c.id),
            title: String(c.title),
            slug: String(c.slug),
            badgeUrl: c.metadata?.badge_url ? String(c.metadata.badge_url) : undefined,
            league: c.metadata?.league ? String(c.metadata.league) : undefined
        }));

    const leagues: SafeLeague[] = leaguesPlain.map((l: any) => ({
        id: String(l.id),
        title: String(l.title),
        slug: String(l.slug),
        logoUrl: l.metadata?.logo_url ? String(l.metadata.logo_url) : undefined,
        logoUrlDark: l.metadata?.logo_url_dark ? String(l.metadata.logo_url_dark) : undefined,
        country: l.metadata?.country ? String(l.metadata.country) : undefined
    }));

    return (
        <div className="w-full">
            {/* Split Hero */}
            <SplitHero />

            {/* Trending + Match Center - Two Column Layout */}
            <section className="mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <HomeTrendingSection />
                    <div style={{ maxWidth: '512px', margin: '0 auto', width: '100%', paddingTop: '100px' }}>
                        <MatchCenterWidget />
                    </div>
                </div>
            </section>

            {/* Featured Clubs */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {featuredClubs.map((club) => (
                        <Link key={club.id} href={`/topic/${club.slug}`}>
                            <Card variant="interactive" className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 group">
                                {club.badgeUrl && (
                                    <img
                                        src={club.badgeUrl}
                                        alt={club.title}
                                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                        {club.title}
                                    </h3>
                                    {club.league && (
                                        <Badge variant="secondary" className="text-[10px] mt-1.5">
                                            {club.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                        </Badge>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Top Leagues */}
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
                        const countryFlagImg = COUNTRY_FLAG_IMAGES[league.country || ""];

                        return (
                            <Link key={league.id} href={`/topic/${league.slug}`}>
                                <Card variant="interactive" className="group p-4 text-center">
                                    <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                                        {league.logoUrl ? (
                                            <>
                                                <img
                                                    src={league.logoUrl}
                                                    alt={league.title}
                                                    className="max-w-full max-h-full object-contain dark:hidden"
                                                />
                                                <img
                                                    src={league.logoUrlDark || league.logoUrl}
                                                    alt={league.title}
                                                    className="max-w-full max-h-full object-contain hidden dark:block"
                                                />
                                            </>
                                        ) : countryFlagImg ? (
                                            <img src={countryFlagImg} alt={league.country} className="w-10 h-10 object-cover rounded" />
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
