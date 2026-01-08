import { Shield, Trophy, ChevronRight, User, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SplitHero } from "@/components/hero/SplitHero";
import { HomeTrendingSection, HomeTrendingRows } from "@/components/hero/HomeTrendingSection";
import { MobileTakeFeed } from "@/components/hero/MobileTakeFeed";

import { MatchCenterWidget } from "@/components/widgets/MatchCenterWidget";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getHeroEntities } from "@/app/actions/hero-data";
import { TopicCard } from "@/components/TopicCard";
import { ALLOWED_LEAGUES } from "@midfield/logic/src/constants";
import { getLeagueLogoUrls } from "@/lib/entity-helpers";

// =============================================================================
// HOMEPAGE - Using deep clones to avoid RSC serialization issues
// Cache hero data for 1 hour since it's curated static content
// =============================================================================

// Add cache revalidation
export const revalidate = 60; // 1 minute - fresher content for hero feed

const COUNTRY_FLAG_IMAGES: Record<string, string> = {
    "England": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/england.png",
    "Spain": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/spain.png",
    "Italy": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/italy.png",
    "Germany": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/germany.png",
    "France": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/france.png",
};

// Curated high-profile players - organized in rotations of 8
const PLAYER_ROTATIONS = [
    // Rotation 1: Global superstars
    ['erling-haaland', 'kylian-mbapp-34162098', 'vincius-jnior-34161324', 'jude-bellingham-34171882', 'mohamed-salah-34145506', 'kevin-de-bruyne-34155057', 'bukayo-saka', 'rodri'],
    // Rotation 2: Premier League Elite  
    ['phil-foden', 'bruno-fernandes', 'cole-palmer', 'martin-degaard', 'harry-kane-34146220', 'bukayo-saka', 'kevin-de-bruyne-34155057', 'rodri'],
    // Rotation 3: Mix
    ['lamine-yamal', 'erling-haaland', 'mohamed-salah-34145506', 'jude-bellingham-34171882', 'vincius-jnior-34161324', 'phil-foden', 'bruno-fernandes', 'cole-palmer'],
    // Rotation 4: Icons & Stars
    ['kylian-mbapp-34162098', 'harry-kane-34146220', 'martin-degaard', 'lamine-yamal', 'erling-haaland', 'bukayo-saka', 'rodri', 'phil-foden']
];

// Randomly select one player rotation
const FEATURED_PLAYER_SLUGS = PLAYER_ROTATIONS[Math.floor(Math.random() * PLAYER_ROTATIONS.length)];

// Curated high-profile clubs - organized in rotations of 4
const CLUB_ROTATIONS = [
    // Rotation 1: European Elite
    ['real-madrid-133738', 'manchester-city-133613', 'barcelona-133739', 'bayern-munich-133664'],
    // Rotation 2: Premier League Powers
    ['arsenal-133604', 'liverpool-133602', 'chelsea-133610', 'manchester-united-133612'],
    // Rotation 3: European Challengers
    ['paris-sg-133714', 'inter-milan-133681', 'atltico-madrid-133729', 'borussia-dortmund-133650'],
    // Rotation 4: Rising Forces
    ['tottenham-hotspur-133616', 'newcastle-united-134777', 'aston-villa-133601', 'ac-milan-133667']
];

// Randomly select one club rotation
const FEATURED_CLUB_SLUGS = CLUB_ROTATIONS[Math.floor(Math.random() * CLUB_ROTATIONS.length)];

type SafeClub = {
    id: string;
    title: string;
    slug: string;
    badgeUrl?: string;
    league?: string;
};

type SafePlayer = {
    id: string;
    title: string;
    slug: string;
    photoUrl?: string;
    position?: string;
    clubName?: string;
    rating?: number;
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

    // Fetch hero entities server-side (cached for 1 hour)
    const heroEntities = await getHeroEntities();

    // Fetch curated clubs by slug
    const { data: clubsRaw } = await supabase
        .from('topics')
        .select('id, title, slug, metadata, post_count')
        .eq('type', 'club')
        .eq('is_active', true)
        .in('slug', FEATURED_CLUB_SLUGS);

    // Fetch curated players by slug
    const { data: playersRaw } = await supabase
        .from('topics')
        .select('id, title, slug, metadata, post_count')
        .eq('type', 'player')
        .eq('is_active', true)
        .in('slug', FEATURED_PLAYER_SLUGS);

    // Fetch leagues
    const HOMEPAGE_LEAGUES = [...ALLOWED_LEAGUES, "UEFA Champions League", "UEFA Europa League"];
    const { data: leaguesRaw } = await supabase
        .from('topics')
        .select('id, title, slug, metadata, post_count')
        .eq('type', 'league')
        .eq('is_active', true)
        .in('title', HOMEPAGE_LEAGUES)
        .order('title', { ascending: true });

    // CRITICAL: Deep clone to break Supabase references, then extract primitives
    const clubsPlain = JSON.parse(JSON.stringify(clubsRaw || []));
    const playersPlain = JSON.parse(JSON.stringify(playersRaw || []));
    const leaguesPlain = JSON.parse(JSON.stringify(leaguesRaw || []));

    // Enrich players with club info (matching search results behavior)
    const playerIds = playersPlain.map((p: any) => p.id);
    let clubMap = new Map();

    if (playerIds.length > 0) {
        const { data: relationships } = await supabase
            .from('topic_relationships')
            .select(`
                child_topic_id,
                parent_topic:topics!topic_relationships_parent_topic_id_fkey(
                    id,
                    title,
                    metadata
                )
            `)
            .in('child_topic_id', playerIds)
            .eq('relationship_type', 'plays_for');

        (relationships || []).forEach((rel: any) => {
            if (rel.parent_topic) {
                clubMap.set(rel.child_topic_id, {
                    name: rel.parent_topic.title,
                    badge_url: rel.parent_topic.metadata?.badge_url
                });
            }
        });
    }

    const leagues = leaguesPlain.map((l: any) => {
        const logoUrls = getLeagueLogoUrls(String(l.slug), l.metadata?.badge_url || l.metadata?.logo_url);
        return {
            id: String(l.id),
            title: String(l.title),
            slug: String(l.slug),
            type: 'league',
            metadata: {
                ...l.metadata,
                logo_url: logoUrls.imageUrl,
                logo_url_dark: logoUrls.imageDarkUrl
            },
            post_count: l.post_count || 0
        };
    });

    // Fetch vote counts for ALL displayed topics on this page
    const allTopicIds = [
        ...clubsPlain.map((c: any) => c.id),
        ...playersPlain.map((p: any) => p.id),
        ...leaguesPlain.map((l: any) => l.id)
    ];

    let voteMap = new Map();
    if (allTopicIds.length > 0) {
        const { data: voteCounts } = await supabase.rpc('get_topic_vote_counts', {
            topic_ids: allTopicIds
        });

        if (voteCounts) {
            voteCounts.forEach((v: any) => {
                voteMap.set(v.topic_id, { up: v.upvotes, down: v.downvotes });
            });
        }
    }

    // Sort clubs by our curated order - preserve full structure for TopicCard
    const featuredClubs = FEATURED_CLUB_SLUGS
        .map(slug => clubsPlain.find((c: any) => c.slug === slug))
        .filter(Boolean)
        .map((c: any) => ({
            id: String(c.id),
            title: String(c.title),
            slug: String(c.slug),
            type: 'club',
            metadata: c.metadata || {},
            post_count: c.post_count || 0,
            upvotes: voteMap.get(c.id)?.up || 0,
            downvotes: voteMap.get(c.id)?.down || 0
        }));

    // Sort players by our curated order - preserve full structure for TopicCard with clubInfo
    const featuredPlayers = FEATURED_PLAYER_SLUGS
        .map(slug => playersPlain.find((p: any) => p.slug === slug))
        .filter(Boolean)
        .map((p: any) => ({
            id: String(p.id),
            title: String(p.title),
            slug: String(p.slug),
            type: 'player',
            metadata: p.metadata || {},
            post_count: p.post_count || 0,
            clubInfo: clubMap.get(p.id) || null,
            upvotes: voteMap.get(p.id)?.up || 0,
            downvotes: voteMap.get(p.id)?.down || 0
        }));

    const enrichedLeagues = leagues.map((l: any) => ({
        ...l,
        upvotes: voteMap.get(l.id)?.up || 0,
        downvotes: voteMap.get(l.id)?.down || 0
    }));

    return (
        <div className="w-full">
            {/* Split Hero - SSR data, no loading state */}
            <SplitHero entities={heroEntities} />

            {/* Mobile Feed - Immediately after Hero */}
            <div className="lg:hidden mt-6 mb-8">
                <MobileTakeFeed />
            </div>

            {/* Trending + Match Center - Two Column Layout */}
            <section className="mb-10 lg:mb-20">
                {/* Trending Header - Outside grid so it doesn't affect centering */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-neutral-100">
                        Trending
                    </h2>
                </div>
                {/* Grid: Only rows + widget - mathematically centered */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <HomeTrendingRows />
                    {/* Desktop only: perfectly centered to trending rows */}
                    <div className="hidden lg:flex flex-col" style={{ maxWidth: '420px', margin: '0 auto', width: '100%' }}>
                        <MatchCenterWidget />
                    </div>
                </div>
            </section>

            {/* Mobile Layout - Match Center Only */}
            <div className="lg:hidden flex flex-col gap-6 pb-12">
                <MatchCenterWidget />
            </div>

            {/* Featured Players */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="font-display text-xl sm:text-2xl font-semibold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Featured Players
                    </h2>
                    <Link href="/players">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {featuredPlayers.map((player) => (
                        <TopicCard key={player.id} topic={player} showWatermark={true} />
                    ))}
                </div>
            </section>

            {/* Featured Clubs */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="font-display text-xl sm:text-2xl font-semibold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {featuredClubs.map((club) => (
                        <TopicCard key={club.id} topic={club} />
                    ))}
                </div>
            </section>

            {/* Top Leagues */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="font-display text-xl sm:text-2xl font-semibold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Top Leagues
                    </h2>
                    <Link href="/leagues">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                            View All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {enrichedLeagues.map((league: any) => (
                        <TopicCard key={league.id} topic={league} />
                    ))}
                </div>
            </section>
        </div >
    );
}
