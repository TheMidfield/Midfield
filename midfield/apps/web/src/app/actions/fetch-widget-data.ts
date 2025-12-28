"use server";

import { createClient } from "@/lib/supabase/server";
import { getTopicBySlug, getPlayersByClub, getPlayerClub, getClubsByLeague, getTopicsByType } from "@midfield/logic/src/topics";

export type WidgetEntity = {
    id: string;
    title: string;
    slug: string;
    type: string;
    imageUrl?: string;
    relation?: string;
};

export type WidgetTake = {
    id: string;
    title: string; // content truncated
    author: {
        name: string;
        handle: string;
        avatar?: string;
    };
    likes: number;
    comments: number;
    timeAgo: string;
};

export type SimilarEntity = {
    id: string;
    title: string;
    slug: string;
    type: string;
    imageUrl?: string;
    reason: 'teammate' | 'same_position' | 'same_league' | 'same_club' | 'similar_rating' | 'rival' | 'top_performer' | 'cross_league' | 'other_league';
    subtitle?: string;
    rating?: number;
    score: number; // Internal scoring for sorting
    leagueBadge?: string; // For clubs - show their league badge
};

export async function getTrendingTopicsData() {
    const supabase = await createClient();

    // Fetch top topics by post_count
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('post_count', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching trending:", error);
        return [];
    }

    return data.map((topic, index) => ({
        id: topic.id,
        rank: index + 1,
        tag: topic.title,
        slug: topic.slug,
        posts: topic.post_count + " posts", // format number nicely if needed
        isRising: index < 2 // Simple logic for now
    }));
}

export async function getRelatedTopicsData(slug?: string) {
    if (!slug) return { entities: [], takes: [] };

    const topic = await getTopicBySlug(slug);
    if (!topic) return { entities: [], takes: [] };

    let entities: WidgetEntity[] = [];

    // 1. Fetch Related Entities based on type
    if (topic.type === 'club') {
        const players = await getPlayersByClub(topic.id);
        entities = players.slice(0, 8).map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: p.type,
            imageUrl: (p.metadata as any)?.photo_url || (p.metadata as any)?.badge_url,
            relation: (p.metadata as any)?.position || "Player"
        }));
    } else if (topic.type === 'player') {
        const club = await getPlayerClub(topic.id);
        if (club) {
            entities.push({
                id: club.id,
                title: club.title,
                slug: club.slug,
                type: club.type,
                imageUrl: (club.metadata as any)?.badge_url,
                relation: "Club"
            });

            // Get Teammates
            const teammates = await getPlayersByClub(club.id);
            const others = teammates
                .filter(t => t.id !== topic.id)
                .slice(0, 7)
                .map(t => ({
                    id: t.id,
                    title: t.title,
                    slug: t.slug,
                    type: t.type,
                    imageUrl: (t.metadata as any)?.photo_url,
                    relation: "Teammate"
                }));
            entities = [...entities, ...others];
        }
    } else if (topic.type === 'league') {
        const clubs = await getClubsByLeague((topic.metadata as any)?.league || topic.title);
        entities = clubs.slice(0, 8).map(c => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            type: c.type,
            imageUrl: (c.metadata as any)?.badge_url,
            relation: "Club"
        }));
    }

    // 2. Fetch Related Takes
    // Query posts for this topic
    const supabase = await createClient();
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            id, 
            content, 
            reaction_count, 
            reply_count, 
            created_at,
            author:users!posts_author_id_fkey(username, avatar_url)
        `)
        .eq('topic_id', topic.id)
        .order('reaction_count', { ascending: false })
        .limit(5);

    const takes: WidgetTake[] = (posts || []).map((post: any) => ({
        id: post.id,
        title: post.content, // content is "title" for takes
        author: {
            name: post.author?.username || "User",
            handle: "@" + (post.author?.username?.toLowerCase() || "user"),
            avatar: post.author?.avatar_url
        },
        likes: post.reaction_count || 0,
        comments: post.reply_count || 0,
        timeAgo: new Date(post.created_at).toLocaleDateString() // Simplification
    }));

    return { entities, takes };
}

/**
 * Smart "Similar" recommendations algorithm
 * Lightweight but effective - uses existing indexed queries
 * With slight randomization for variety
 */
export async function getSimilarTopicsData(slug?: string): Promise<SimilarEntity[]> {
    if (!slug) return [];

    const supabase = await createClient();
    const topic = await getTopicBySlug(slug);
    if (!topic) return [];

    const results: SimilarEntity[] = [];
    const addedIds = new Set<string>([topic.id]); // Track to avoid duplicates

    const metadata = topic.metadata as any;

    // Helper to add unique results with slight randomization
    const addResult = (entity: SimilarEntity) => {
        if (!addedIds.has(entity.id)) {
            addedIds.add(entity.id);
            // Add slight random factor (±10) to score for variety
            entity.score += Math.random() * 20 - 10;
            results.push(entity);
        }
    };

    // Shuffle helper for variety
    const shuffleArray = <T>(arr: T[]): T[] => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Helper to normalize position for comparison
    const normalizePosition = (pos: string): string => {
        return pos?.toLowerCase().trim() || "";
    };

    // === PLAYER RECOMMENDATIONS ===
    if (topic.type === 'player') {
        const position = metadata?.position;
        const normalizedPosition = normalizePosition(position);
        const rating = (topic.fc26_data as any)?.overall;

        // 1. Get player's club first (to know league)
        const club = await getPlayerClub(topic.id);
        const clubMeta = club?.metadata as any;
        const league = clubMeta?.league;

        if (club) {
            addResult({
                id: club.id,
                title: club.title,
                slug: club.slug,
                type: 'club',
                imageUrl: clubMeta?.badge_url,
                reason: 'same_club',
                subtitle: league || 'Club',
                score: 100
            });
        }

        // Fetch all players with fc26_data for matching (more efficient than multiple queries)
        const { data: allPlayers } = await supabase
            .from('topics')
            .select('id, title, slug, metadata, fc26_data')
            .eq('type', 'player')
            .eq('is_active', true)
            .not('fc26_data', 'is', null)
            .neq('id', topic.id)
            .limit(500);

        // 2. Same position players
        if (normalizedPosition) {
            const positionMatches = (allPlayers || [])
                .filter(p => {
                    if (addedIds.has(p.id)) return false;
                    const pPos = normalizePosition((p.metadata as any)?.position);
                    if (!pPos) return false;
                    return pPos === normalizedPosition || 
                        pPos.includes(normalizedPosition) || 
                        normalizedPosition.includes(pPos);
                });

            shuffleArray(positionMatches).slice(0, 2).forEach(p => {
                addResult({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    type: 'player',
                    imageUrl: (p.metadata as any)?.photo_url,
                    reason: 'same_position',
                    subtitle: (p.metadata as any)?.position,
                    rating: (p.fc26_data as any)?.overall,
                    score: 85
                });
            });
        }

        // 3. Teammates (just 1)
        if (club) {
            const teammates = await getPlayersByClub(club.id);
            const topTeammates = teammates
                .filter(t => t.id !== topic.id && !addedIds.has(t.id))
                .sort((a, b) => {
                    const ratingA = (a.fc26_data as any)?.overall || 0;
                    const ratingB = (b.fc26_data as any)?.overall || 0;
                    return ratingB - ratingA;
                })
                .slice(0, 4);

            shuffleArray(topTeammates).slice(0, 1).forEach(t => {
                addResult({
                    id: t.id,
                    title: t.title,
                    slug: t.slug,
                    type: 'player',
                    imageUrl: (t.metadata as any)?.photo_url,
                    reason: 'teammate',
                    subtitle: (t.metadata as any)?.position,
                    rating: (t.fc26_data as any)?.overall,
                    score: 70
                });
            });
        }

        // 4. Similar rating players (±5)
        if (rating && rating > 0) {
            const ratingMatches = (allPlayers || [])
                .filter(p => {
                    if (addedIds.has(p.id)) return false;
                    const r = (p.fc26_data as any)?.overall;
                    return r && Math.abs(r - rating) <= 5;
                });
            
            shuffleArray(ratingMatches).slice(0, 2).forEach(p => {
                addResult({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    type: 'player',
                    imageUrl: (p.metadata as any)?.photo_url,
                    reason: 'similar_rating',
                    subtitle: (p.metadata as any)?.position,
                    rating: (p.fc26_data as any)?.overall,
                    score: 55
                });
            });
        }
    }

    // === CLUB RECOMMENDATIONS ===
    else if (topic.type === 'club') {
        const league = metadata?.league;

        // 1. Top 2 players from the club (randomized from top 5)
        const players = await getPlayersByClub(topic.id);
        const topPlayers = players
            .sort((a, b) => {
                const ratingA = (a.fc26_data as any)?.overall || 0;
                const ratingB = (b.fc26_data as any)?.overall || 0;
                return ratingB - ratingA;
            })
            .slice(0, 5);

        shuffleArray(topPlayers).slice(0, 2).forEach(p => {
            addResult({
                id: p.id,
                title: p.title,
                slug: p.slug,
                type: 'player',
                imageUrl: (p.metadata as any)?.photo_url,
                reason: 'top_performer',
                subtitle: (p.metadata as any)?.position,
                rating: (p.fc26_data as any)?.overall,
                score: 90
            });
        });

        // 2. Same league clubs
        if (league) {
            const leagueClubs = await getClubsByLeague(league);
            const rivals = leagueClubs.filter(c => c.id !== topic.id && !addedIds.has(c.id));

            shuffleArray(rivals).slice(0, 2).forEach(c => {
                addResult({
                    id: c.id,
                    title: c.title,
                    slug: c.slug,
                    type: 'club',
                    imageUrl: (c.metadata as any)?.badge_url,
                    reason: 'same_league',
                    subtitle: league,
                    score: 70
                });
            });

            // 3. Cross-league clubs - get all clubs from other leagues
            const { data: otherClubs } = await supabase
                .from('topics')
                .select('*')
                .eq('type', 'club')
                .eq('is_active', true)
                .not('metadata->>league', 'eq', league)
                .limit(20);

            const crossLeague = (otherClubs || []).filter(c => !addedIds.has(c.id));

            shuffleArray(crossLeague).slice(0, 2).forEach(c => {
                addResult({
                    id: c.id,
                    title: c.title,
                    slug: c.slug,
                    type: 'club',
                    imageUrl: (c.metadata as any)?.badge_url,
                    reason: 'cross_league',
                    subtitle: (c.metadata as any)?.league,
                    score: 55
                });
            });
        }
    }

    // === LEAGUE RECOMMENDATIONS ===
    else if (topic.type === 'league' || topic.type === 'competition') {
        const leagueName = metadata?.league || topic.title;

        // Top clubs in the league
        const clubs = await getClubsByLeague(leagueName);
        shuffleArray(clubs).slice(0, 4).forEach(c => {
            addResult({
                id: c.id,
                title: c.title,
                slug: c.slug,
                type: 'club',
                imageUrl: (c.metadata as any)?.badge_url,
                reason: 'same_league',
                subtitle: leagueName,
                score: 80
            });
        });

        // Other random leagues
        const { data: otherLeagues } = await supabase
            .from('topics')
            .select('*')
            .eq('type', 'league')
            .eq('is_active', true)
            .neq('id', topic.id)
            .limit(10);

        shuffleArray(otherLeagues || []).slice(0, 2).forEach(l => {
            addResult({
                id: l.id,
                title: l.title,
                slug: l.slug,
                type: 'league',
                imageUrl: (l.metadata as any)?.badge_url,
                reason: 'other_league',
                subtitle: '',
                score: 50
            });
        });
    }

    // Sort by score and return top 6
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
}
