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
    const now = Date.now();
    const hours24 = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const hours72 = new Date(now - 72 * 60 * 60 * 1000).toISOString(); // 3 days for fallback

    // Aggregate activity from multiple sources in parallel
    const [postsResult, votesResult, reactionsResult] = await Promise.all([
        // Recent posts by topic (3 days)
        supabase
            .from('posts')
            .select('topic_id, created_at')
            .gte('created_at', hours72)
            .eq('is_deleted', false),
        // Recent topic votes (3 days)
        supabase
            .from('topic_votes')
            .select('topic_id, created_at')
            .gte('created_at', hours72),
        // Recent reactions through posts (3 days)
        supabase
            .from('reactions')
            .select('created_at, posts!inner(topic_id)')
            .gte('created_at', hours72)
    ]);

    // Time decay function: recent activity worth more
    // Last 24h = 1.0x, 24-48h = 0.5x, 48-72h = 0.25x
    const getTimeWeight = (createdAt: string) => {
        const age = now - new Date(createdAt).getTime();
        const hoursAgo = age / (1000 * 60 * 60);
        if (hoursAgo <= 24) return 1.0;
        if (hoursAgo <= 48) return 0.5;
        return 0.25;
    };

    // Count activity per topic with time decay
    const activityMap = new Map<string, number>();

    // Posts (weight: 3)
    (postsResult.data || []).forEach(p => {
        if (p.topic_id) {
            const weight = 3 * getTimeWeight(p.created_at);
            activityMap.set(p.topic_id, (activityMap.get(p.topic_id) || 0) + weight);
        }
    });

    // Votes (weight: 2)
    (votesResult.data || []).forEach(v => {
        if (v.topic_id) {
            const weight = 2 * getTimeWeight(v.created_at);
            activityMap.set(v.topic_id, (activityMap.get(v.topic_id) || 0) + weight);
        }
    });

    // Reactions (weight: 1)
    (reactionsResult.data || []).forEach(r => {
        const topicId = (r.posts as any)?.topic_id;
        if (topicId) {
            const weight = 1 * getTimeWeight(r.created_at);
            activityMap.set(topicId, (activityMap.get(topicId) || 0) + weight);
        }
    });

    // Sort by activity score
    const sortedTopicIds = [...activityMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id]) => id);

    // If not enough activity, fall back to high-rated players with FC26 data
    if (sortedTopicIds.length < 4) {
        const { data: fallbackTopics } = await supabase
            .from('topics')
            .select('id')
            .eq('is_active', true)
            .eq('type', 'player')
            .not('fc26_data', 'is', null)
            .order('follower_count', { ascending: false })
            .limit(6);

        const existingIds = new Set(sortedTopicIds);
        (fallbackTopics || []).forEach(t => {
            if (!existingIds.has(t.id) && sortedTopicIds.length < 6) {
                sortedTopicIds.push(t.id);
            }
        });
    }

    if (sortedTopicIds.length === 0) return [];

    // Fetch topic details AND take counts
    const [topicsRes, takeCountsRes] = await Promise.all([
        supabase
            .from('topics')
            .select('id, title, slug, type, metadata, fc26_data')
            .in('id', sortedTopicIds),
        supabase
            .from('posts')
            .select('topic_id')
            .in('topic_id', sortedTopicIds)
            .eq('is_deleted', false)
    ]);

    // Count takes per topic
    const takeCountMap = new Map<string, number>();
    (takeCountsRes.data || []).forEach(post => {
        const count = takeCountMap.get(post.topic_id) || 0;
        takeCountMap.set(post.topic_id, count + 1);
    });

    // Preserve order by activity
    const topicsMap = new Map((topicsRes.data || []).map(t => [t.id, t]));

    return sortedTopicIds
        .map((id, index) => {
            const topic = topicsMap.get(id);
            if (!topic) return null;
            const metadata = topic.metadata as any;
            return {
                id: topic.id,
                rank: index + 1,
                title: topic.title,
                slug: topic.slug,
                type: topic.type,
                imageUrl: metadata?.photo_url || metadata?.badge_url || metadata?.logo_url,
                activity: activityMap.get(id) || 0,
                takeCount: takeCountMap.get(id) || 0,
                // Metadata for badges
                position: metadata?.position,
                league: metadata?.league,
                rating: (topic.fc26_data as any)?.overall
            };
        })
        .filter(Boolean) as TrendingTopic[];
}

export type TrendingTopic = {
    id: string;
    rank: number;
    title: string;
    slug: string;
    type: string;
    imageUrl?: string;
    activity: number;
    takeCount: number;
    position?: string;
    league?: string;
    rating?: number;
};

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
                .select('id, title, slug, type, metadata')
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
            .select('id, title, slug, type, metadata')
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

// ==================== MATCH CENTER DATA ====================

// UEFA Club Rankings (Top 25) - used for scoring fixture importance
const UEFA_CLUB_RANKINGS: Record<string, number> = {
    'real-madrid': 1,
    'bayern-munich': 2,
    'bayern-munchen': 2,
    'inter-milan': 3,
    'internazionale': 3,
    'inter': 3,
    'manchester-city': 4,
    'liverpool': 5,
    'paris-saint-germain': 6,
    'psg': 6,
    'borussia-dortmund': 7,
    'bayer-leverkusen': 8,
    'barcelona': 9,
    'fc-barcelona': 9,
    'arsenal': 10,
    'atletico-madrid': 11,
    'chelsea': 12,
    'as-roma': 13,
    'roma': 13,
    'benfica': 14,
    'sl-benfica': 14,
    'eintracht-frankfurt': 15,
    'atalanta': 16,
    'manchester-united': 17,
    'psv-eindhoven': 18,
    'psv': 18,
    'feyenoord': 19,
    'club-brugge': 20,
    'sporting-cp': 21,
    'sporting-lisbon': 21,
    'tottenham-hotspur': 22,
    'tottenham': 22,
    'spurs': 22,
    'fiorentina': 23,
    'west-ham-united': 24,
    'west-ham': 24,
    'juventus': 25,
};

// League prestige rankings - REBALANCED for diversity
const LEAGUE_PRESTIGE: Record<string, number> = {
    'english-premier-league': 5,
    'premier-league': 5,
    'la-liga': 5,  // Increased from 4
    'spanish-la-liga': 5,  // Increased from 4
    'serie-a': 5,  // Increased from 4
    'italian-serie-a': 5,  // Increased from 4 (was 'italian-serie-a-4332')
    'italian-serie-a-4332': 5,  // Support both slug formats
    'spanish-la-liga-4335': 5,  // Support both slug formats
    'french-ligue-1-4334': 4,  // Support both slug formats
    'bundesliga': 4,  // Increased from 3
    'german-bundesliga': 4,  // Increased from 3
    'ligue-1': 4,  // Increased from 3
    'french-ligue-1': 4,  // Increased from 3
    'champions-league': 6,
    'uefa-champions-league': 6,
    'europa-league': 4,
    'uefa-europa-league': 4,
};

export type MatchCenterFixture = {
    id: number;
    date: string;
    homeTeam: {
        id: string;
        title: string;
        slug: string;
        badgeUrl?: string;
        abbreviation?: string;
    };
    awayTeam: {
        id: string;
        title: string;
        slug: string;
        badgeUrl?: string;
        abbreviation?: string;
    };
    competition: {
        id: string;
        title: string;
        slug: string;
        logoUrl?: string;
    };
    venue?: string;
    importance: number; // 0-100 score
    isTopMatch: boolean; // Featured/big match indicator
    status?: 'NS' | 'LIVE' | 'HT' | 'FT' | 'PST' | 'ABD';
};

/**
 * Get top fixtures for the Match Center widget
 * Scoring factors:
 * - UEFA rankings of both teams
 * - League prestige (BALANCED - all top 5 leagues equal)
 * - League standings proximity (close positions = more exciting)
 * - Derby/rivalry bonus
 * - League diversity bonus (ensures variety)
 */
export async function getMatchCenterData(limit = 6): Promise<MatchCenterFixture[]> {
    const supabase = await createClient();
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch upcoming fixtures with team and competition data
    const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select(`
            id,
            date,
            venue,
            home_team_id,
            away_team_id,
            competition_id,
            status,
            homeTeam:topics!fixtures_home_team_id_fkey(id, title, slug, metadata),
            awayTeam:topics!fixtures_away_team_id_fkey(id, title, slug, metadata),
            competition:topics!fixtures_competition_id_fkey(id, title, slug, metadata)
        `)
        .gte('date', now.toISOString())
        .lte('date', weekAhead.toISOString())
        .not('status', 'in', '("FT","ABD")') // strict enum check
        .order('date', { ascending: true })
        .limit(100); // Get more to filter/score

    if (error || !fixtures?.length) {
        return [];
    }

    // Get league standings for position-based scoring
    const { data: standings } = await supabase
        .from('league_standings')
        .select('team_id, position, league_id');

    const standingsMap = new Map<string, { rank: number; leagueId: string }>();
    (standings || []).forEach(s => {
        standingsMap.set(s.team_id, { rank: s.position, leagueId: s.league_id });
    });

    // Score and transform fixtures
    const scoredFixtures = fixtures.map((f: any) => {
        const homeTeam = f.homeTeam;
        const awayTeam = f.awayTeam;
        const competition = f.competition;

        if (!homeTeam || !awayTeam || !competition) return null;

        let importance = 0;

        // 1. UEFA Rankings factor (0-30 points) - REDUCED from 40
        const homeUefa = UEFA_CLUB_RANKINGS[homeTeam.slug] || 50;
        const awayUefa = UEFA_CLUB_RANKINGS[awayTeam.slug] || 50;
        const avgUefa = (homeUefa + awayUefa) / 2;
        if (avgUefa <= 15) {
            importance += Math.max(0, 30 - avgUefa);
        } else if (avgUefa <= 30) {
            importance += Math.max(0, 20 - (avgUefa - 15));
        } else {
            importance += Math.max(0, 8 - (avgUefa - 30) / 2);
        }

        // 2. League prestige (0-25 points) - SAME weight as before
        const leaguePrestige = LEAGUE_PRESTIGE[competition.slug] || 1;
        importance += leaguePrestige * 5;

        // 3. League standings proximity (0-20 points)
        const homeStanding = standingsMap.get(homeTeam.id);
        const awayStanding = standingsMap.get(awayTeam.id);
        if (homeStanding && awayStanding && homeStanding.leagueId === awayStanding.leagueId) {
            const posDiff = Math.abs(homeStanding.rank - awayStanding.rank);
            importance += Math.max(0, 20 - posDiff * 2);

            // Title race bonus: both teams in top 4
            if (homeStanding.rank <= 4 && awayStanding.rank <= 4) {
                importance += 10;
            }
        }

        // 4. Big match bonus: two top 10 UEFA teams
        const isBigMatch = homeUefa <= 10 && awayUefa <= 10;
        if (isBigMatch) {
            importance += 15;
        }

        // 5. Time factor: matches sooner are slightly more relevant
        const hoursUntil = (new Date(f.date).getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntil <= 48) {
            importance += 5;
        }

        return {
            id: f.id,
            date: f.date,
            homeTeam: {
                id: homeTeam.id,
                title: homeTeam.title,
                slug: homeTeam.slug,
                badgeUrl: (homeTeam.metadata as any)?.badge_url,
                abbreviation: (homeTeam.metadata as any)?.abbreviation,
            },
            awayTeam: {
                id: awayTeam.id,
                title: awayTeam.title,
                slug: awayTeam.slug,
                badgeUrl: (awayTeam.metadata as any)?.badge_url,
                abbreviation: (awayTeam.metadata as any)?.abbreviation,
            },
            competition: {
                id: competition.id,
                title: competition.title,
                slug: competition.slug,
                logoUrl: (competition.metadata as any)?.logo_url,
            },
            venue: f.venue,
            importance,
            isTopMatch: importance >= 60,
            status: f.status,
        };
    }).filter(Boolean) as MatchCenterFixture[];

    // Pure power ranking with soft diversity adjustment
    // Apply a small penalty for "league saturation" to encourage variety
    const leagueCount = new Map<string, number>();

    const adjustedFixtures = scoredFixtures.map(f => {
        const league = f.competition.slug;
        const currentCount = leagueCount.get(league) || 0;

        // Soft penalty: -3 points per existing match from same league (max -12)
        // This prevents 100% same league without destroying power ranking
        const diversityPenalty = Math.min(currentCount * 3, 12);

        return {
            ...f,
            adjustedImportance: f.importance - diversityPenalty
        };
    });

    // Sort by adjusted importance
    const sorted = adjustedFixtures.sort((a, b) => b.adjustedImportance - a.adjustedImportance);

    // Pick top matches and track league counts
    const result: MatchCenterFixture[] = [];
    sorted.forEach(f => {
        if (result.length < limit) {
            result.push(f);
            const league = f.competition.slug;
            leagueCount.set(league, (leagueCount.get(league) || 0) + 1);
        }
    });

    return result;
}

// ==================== HERO LIVE FEED DATA ====================

export type HeroTake = {
    id: string;
    content: string;
    createdAt: string;
    author: {
        username: string;
        avatarUrl?: string;
    };
    topic: {
        id: string;
        title: string;
        slug: string;
        type: string;
        imageUrl?: string;
    };
    reactionCount: number;
    replyCount: number;
};

/**
 * Fetch recent takes for the hero live feed
 * Prioritizes recent, engaging content with topic variety
 */
export async function getHeroLiveFeed(limit = 20): Promise<HeroTake[]> {
    const supabase = await createClient();
    const hours72 = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    // Fetch recent posts with topic and author data
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id,
            content,
            created_at,
            reaction_count,
            reply_count,
            author:users!posts_author_id_fkey(username, avatar_url),
            topic:topics!posts_topic_id_fkey(id, title, slug, type, metadata)
        `)
        .is('parent_post_id', null) // Only root posts (takes), not replies
        .eq('is_deleted', false)
        .gte('created_at', hours72)
        .order('created_at', { ascending: false })
        .limit(50); // Fetch more to filter/diversify

    if (error || !posts?.length) {
        // Fallback: get any recent takes
        const { data: fallbackPosts } = await supabase
            .from('posts')
            .select(`
                id,
                content,
                created_at,
                reaction_count,
                reply_count,
                author:users!posts_author_id_fkey(username, avatar_url),
                topic:topics!posts_topic_id_fkey(id, title, slug, type, metadata)
            `)
            .is('parent_post_id', null)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(limit);

        return transformPosts(fallbackPosts || []);
    }

    // Diversify: ensure variety of topics (max 2 per topic)
    const topicCounts = new Map<string, number>();
    const diversified = posts.filter((p: any) => {
        const topicId = p.topic?.id;
        if (!topicId) return false;
        const count = topicCounts.get(topicId) || 0;
        if (count >= 2) return false;
        topicCounts.set(topicId, count + 1);
        return true;
    });

    return transformPosts(diversified.slice(0, limit));
}

function transformPosts(posts: any[]): HeroTake[] {
    return posts.map((p: any) => ({
        id: p.id,
        content: p.content,
        createdAt: p.created_at,
        author: {
            username: p.author?.username || 'Anonymous',
            avatarUrl: p.author?.avatar_url,
        },
        topic: {
            id: p.topic?.id || '',
            title: p.topic?.title || 'Unknown',
            slug: p.topic?.slug || '',
            type: p.topic?.type || 'topic',
            imageUrl: (p.topic?.metadata as any)?.photo_url || (p.topic?.metadata as any)?.badge_url,
        },
        reactionCount: p.reaction_count || 0,
        replyCount: p.reply_count || 0,
    })).filter((t: HeroTake) => t.topic.id && t.content);
}

// ==================== RECENT RESULTS DATA ====================

export type RecentResult = {
    id: number;
    date: string;
    homeTeam: {
        id: string;
        title: string;
        slug: string;
        badgeUrl?: string;
        abbreviation?: string;
    };
    awayTeam: {
        id: string;
        title: string;
        slug: string;
        badgeUrl?: string;
        abbreviation?: string;
    };
    competition: {
        id: string;
        title: string;
        slug: string;
        logoUrl?: string;
    };
    homeScore: number | null;
    awayScore: number | null;
};

export async function getRecentResultsData(limit = 6): Promise<RecentResult[]> {
    const supabase = await createClient();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select(`
            id,
            date,
            home_score,
            away_score,
            homeTeam:topics!fixtures_home_team_id_fkey(id, title, slug, metadata),
            awayTeam:topics!fixtures_away_team_id_fkey(id, title, slug, metadata),
            competition:topics!fixtures_competition_id_fkey(id, title, slug, metadata)
        `)
        .lte('date', now.toISOString())
        .gte('date', weekAgo.toISOString())
        .not('home_score', 'is', null) // Must have a score
        .order('date', { ascending: false })
        .limit(limit);

    if (error || !fixtures) {
        return [];
    }

    return fixtures.map((f: any) => ({
        id: f.id,
        date: f.date,
        homeTeam: {
            id: f.homeTeam.id,
            title: f.homeTeam.title,
            slug: f.homeTeam.slug,
            badgeUrl: (f.homeTeam.metadata as any)?.badge_url,
            abbreviation: (f.homeTeam.metadata as any)?.abbreviation,
        },
        awayTeam: {
            id: f.awayTeam.id,
            title: f.awayTeam.title,
            slug: f.awayTeam.slug,
            badgeUrl: (f.awayTeam.metadata as any)?.badge_url,
            abbreviation: (f.awayTeam.metadata as any)?.abbreviation,
        },
        competition: {
            id: f.competition.id,
            title: f.competition.title,
            slug: f.competition.slug,
            logoUrl: (f.competition.metadata as any)?.logo_url,
        },
        homeScore: f.home_score,
        awayScore: f.away_score,
    }));
}
