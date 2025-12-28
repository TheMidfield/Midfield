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
    };
    topic: {
        title: string;
        slug: string;
        type: string;
        imageUrl?: string;
    };
    reactionCount: number;
};

// Curated high-profile slugs - verified to exist in database
// Curated high-profile slugs - verified to exist in database
const CURATED_ENTITY_SLUGS = [
    'lamine-yamal',              // Yamal
    'jude-bellingham',           // Bellingham
    'real-madrid',               // Club
    'cole-palmer',               // Palmer
    'arsenal',                   // Club
    'english-premier-league',    // League
    'vinicius-junior',           // Vini
    'liverpool',                 // Club
    'spanish-la-liga',           // League
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

/**
 * Fetch recent takes globally (no topic restriction)
 */
export async function getHeroTakes(limit = 6): Promise<HeroTake[]> {
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
        supabase.from('users').select('id, username, avatar_url').in('id', authorIds)
    ]);

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

            return {
                id: String(p.id),
                content: String(p.content),
                createdAt: String(p.created_at),
                reactionCount: Number(p.reaction_count) || 0,
                author: {
                    username: String(author?.username || 'fan'),
                    avatarUrl: author?.avatar_url || undefined
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
