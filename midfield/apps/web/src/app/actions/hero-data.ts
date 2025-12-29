"use server";

import { createClient } from "@/lib/supabase/server";

// =============================================================================
// HERO DATA - Curated, optimized data for the Split Hero
// =============================================================================

export type HeroEntity = {
    id: string;
    title: string;
    slug: string;
    type: string;
    displayName: string;
    imageUrl?: string;
    position?: string;
    rating?: number;
    subtitle?: string;
};

export type HeroTake = {
    id: string;
    content: string;
    createdAt: string;
    author: {
        username: string;
        avatarUrl?: string;
        favoriteClub?: {
            title: string;
            badgeUrl?: string;
        };
    };
    topic: {
        title: string;
        slug: string;
        type: string;
        imageUrl?: string;
    };
    reactionCount: number;
};

// Curated entity slugs (~60) — designed for takes: casual + connoisseur
// Mix: megastars, legends, wonderkids, breakout names, tactical managers, clubs, competitions
const CURATED_ENTITY_SLUGS = [

    // === MEGASTARS / GLOBAL NAMES (grand public) ===
    'kylian-mbapp',                      // Kylian Mbappé
    'erling-haaland-34169116',           // Erling Haaland
    'jude-bellingham',                   // Jude Bellingham
    'mohamed-salah',                     // Mohamed Salah
    'kevin-de-bruyne-34155057',          // Kevin De Bruyne
    'robert-lewandowski-34146705',       // Robert Lewandowski
    'harry-kane-34146220',               // Harry Kane
    'rodri-34163415',                    // Rodri
    'vinicius-jnior',
    'antoine-griezmann',                 // Antoine Griezmann
    'ousmane-dembl-34161375',            // Ousmane Dembélé

    // === MODERN LEGENDS / ICONS (debate fuel) ===
    'luka-modric-34146306',              // Luka Modric
    'manuel-neuer-34146681',             // Manuel Neuer
    'virgil-van-dijk',                   // Virgil van Dijk
    'thibaut-courtois',                  // Thibaut Courtois

    // === "RIGHT NOW" HYPE / RISING SUPERSTARS ===
    'lamine-yamal-34219490',             // Lamine Yamal - huge teen hype
    'jamal-musiala-34173035',            // Jamal Musiala - top-10 global value
    'michael-olise-34172857',            // Michael Olise - Bayern buzz
    'florian-wirtz',                     // Florian Wirtz
    'pedri-34172243',                    // Pedri
    'gavi-34193417',                     // Gavi
    'bukayo-saka-34169884',              // Bukayo Saka
    'cole-palmer-34192430',              // Cole Palmer

    // === WONDERKIDS / NXGN-TYPE CONNOISSEUR PICKS ===
    'endrick-34219641',                  // Endrick
    'estvo-34232908',                    // Estêvão Willian
    'franco-mastantuono',                // Franco Mastantuono
    'pau-cubars-34226456',               // Pau Cubarsí
    'yan-diomande-34336277',             // Yan Diomandé - connoisseur bait
    'dsir-dou-34200291',                 // Désiré Doué

    // === BREAKOUT / CULT-FAVORITES (connoisseur friendly) ===
    'jrmy-doku-34172198',                // Jérémy Doku
    'federico-valverde',                 // Federico Valverde
    'eduardo-camavinga',                 // Eduardo Camavinga
    'martin-degaard-34159218',           // Martin Ødegaard
    'declan-rice-34161584',              // Declan Rice
    'rafael-leo-34165647',               // Rafael Leão
    'khvicha-kvaratskhelia-34178205',    // Khvicha Kvaratskhelia
    'martn-zubimendi-34172850',          // Martín Zubimendi
    'joo-neves-34217442',                // João Neves
    'xavi-simons-34178997',              // Xavi Simons

    // === GOALKEEPERS (keepers get engagement too) ===
    'alisson-becker',                    // Alisson
    'gianluigi-donnarumma-34162303',     // Gianluigi Donnarumma
    'jan-oblak',                         // Jan Oblak

    // === MANAGERS (high debate value: tactics, drama, eras) ===
    'pep-guardiola-34164048',            // Pep Guardiola
    'xabi-alonso',                       // Xabi Alonso
    'mikel-arteta-34145406',             // Mikel Arteta
    'luis-enrique-34164051',             // Luis Enrique
    'diego-simeone',                     // Diego Simeone
    'hansi-flick-34171571',              // Hansi Flick

    // === CLUBS (big + trending + connoisseur) ===
    'real-madrid',                       // Real Madrid
    'barcelona',                         // Barcelona
    'manchester-city',                   // Manchester City
    'arsenal',                           // Arsenal
    'bayern-munich-133664',              // Bayern Munich
    'paris-sg-133714',                   // Paris Saint-Germain
    'inter-milan-133681',                // Inter
    'borussia-dortmund-133650',          // Borussia Dortmund
    'bayer-leverkusen-133666',           // Bayer Leverkusen
    'atltico-madrid',                    // Atlético Madrid
    'napoli-133670',                     // Napoli
    'ac-milan-133667',                   // AC Milan
    'juventus-133676',                   // Juventus

    // === COMPETITIONS / LEAGUES (broad appeal + constant) ===
    'english-premier-league',            // Premier League
    'spanish-la-liga-4335',              // La Liga
    'german-bundesliga-4331',            // Bundesliga
    'italian-serie-a-4332',              // Serie A
    'french-ligue-1-4334',               // Ligue 1
];

// High-profile topics for takes (show interesting discussions)
const HIGH_PROFILE_TOPIC_SLUGS = [
    'lamine-yamal',
    'jude-bellingham',
    'real-madrid',
    'manchester-city',
    'arsenal',
    'manchester-united',
    'barcelona',
    'liverpool',
    'chelsea',
    'english-premier-league'
];

/**
 * Fetch curated entities for the hero cycler
 */
export async function getHeroEntities(): Promise<HeroEntity[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('topics')
            .select('id, title, slug, type, metadata')
            .eq('is_active', true)
            .in('slug', CURATED_ENTITY_SLUGS);

        if (error || !data?.length) {
            console.error('getHeroEntities error:', error?.message);
            return FALLBACK_ENTITIES;
        }

        // Deep clone
        const plain = JSON.parse(JSON.stringify(data));

        // Sort to match our curated order
        const sorted = CURATED_ENTITY_SLUGS
            .map(slug => plain.find((t: any) => t.slug === slug))
            .filter(Boolean);

        return sorted.map((t: any) => ({
            id: String(t.id),
            title: String(t.title),
            slug: String(t.slug),
            type: String(t.type),
            displayName: getDisplayName(t.title, t.type),
            imageUrl: t.type === 'player'
                ? t.metadata?.photo_url
                : t.metadata?.badge_url || t.metadata?.logo_url,
            position: t.metadata?.position,
            rating: t.metadata?.rating ? Number(t.metadata.rating) : undefined,
            subtitle: t.type === 'club' ? t.metadata?.league_name : undefined
        }));

    } catch (err) {
        console.error('getHeroEntities error:', err);
        return FALLBACK_ENTITIES;
    }
}

const FALLBACK_ENTITIES: HeroEntity[] = [
    { id: '1', title: 'Real Madrid', slug: 'real-madrid', type: 'club', displayName: 'Real Madrid', imageUrl: 'https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png' },
    { id: '2', title: 'Premier League', slug: 'english-premier-league', type: 'league', displayName: 'Premier League', imageUrl: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png' },
];

function getDisplayName(title: string, type: string): string {
    if (type === 'player') {
        const parts = title.split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : title;
    }
    if (title.includes('English Premier')) return 'Premier League';
    if (title.includes('Spanish La Liga')) return 'La Liga';
    return title;
}

import { unstable_noStore as noStore } from 'next/cache';

/**
 * Fetch recent takes globally (no topic restriction)
 */
export async function getHeroTakes(limit = 6): Promise<HeroTake[]> {
    noStore(); // Opt out of static caching to ensure fresh data
    try {
        const supabase = await createClient();
        return await getAnyRecentTakes(supabase, limit);
    } catch (err) {
        console.error('getHeroTakes error:', err);
        return [];
    }
}

/* 
 * Deprecated: specific high profile fetching logic removed to ensure content freshness
 */
// async function getHighProfileTakes(...) { ... }


// Helper for fallback fetching
async function getAnyRecentTakes(supabase: any, limit: number): Promise<HeroTake[]> {
    const { data: posts } = await supabase
        .from('posts')
        .select('id, content, created_at, reaction_count, author_id, topic_id')
        .not('topic_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit * 2);

    if (!posts?.length) return [];

    const topicIds = [...new Set(posts.map((p: any) => p.topic_id))];
    const authorIds = [...new Set(posts.map((p: any) => p.author_id).filter(Boolean))];

    const [topicsRes, authorsRes] = await Promise.all([
        supabase.from('topics').select('id, title, slug, type, metadata').in('id', topicIds),
        supabase.from('users').select('id, username, avatar_url, favorite_club_id').in('id', authorIds)
    ]);

    // Fetch favorite clubs if any
    const favClubIds = (authorsRes.data || [])
        .map((u: any) => u.favorite_club_id)
        .filter(Boolean);

    let clubMap = new Map();
    if (favClubIds.length > 0) {
        const { data: clubs } = await supabase
            .from('topics')
            .select('id, title, metadata')
            .in('id', favClubIds);

        clubMap = new Map((clubs || []).map((c: any) => [c.id, c]));
    }

    const topicMap = new Map((topicsRes.data || []).map((t: any) => [t.id, t]));
    const authorMap = new Map((authorsRes.data || []).map((a: any) => [a.id, a]));

    const plainPosts = JSON.parse(JSON.stringify(posts));

    return plainPosts
        .filter((p: any) => p.content && p.content.length > 5)
        .slice(0, limit)
        .map((p: any) => {
            const author = authorMap.get(p.author_id) as any;
            const topic = topicMap.get(p.topic_id) as any;
            if (!topic) return null;

            let favoriteClub = undefined;
            if (author?.favorite_club_id) {
                const club = clubMap.get(author.favorite_club_id);
                if (club) {
                    favoriteClub = {
                        title: club.title,
                        badgeUrl: club.metadata?.badge_url || club.metadata?.logo_url
                    };
                }
            }

            return {
                id: String(p.id),
                content: String(p.content),
                createdAt: String(p.created_at),
                reactionCount: Number(p.reaction_count) || 0,
                author: {
                    username: String(author?.username || 'fan'),
                    avatarUrl: author?.avatar_url || undefined,
                    favoriteClub
                },
                topic: {
                    title: String(topic.title),
                    slug: String(topic.slug),
                    type: String(topic.type),
                    imageUrl: topic.metadata?.photo_url || topic.metadata?.badge_url
                }
            };
        })
        .filter(Boolean) as HeroTake[];
}
