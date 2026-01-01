import { supabase } from "./supabase";
import type { Topic, TopicType } from "@midfield/types";
import { ALLOWED_LEAGUES } from "./constants";
import { getClubAbbreviation } from "./club-abbreviations";

// Re-export for convenience
export { getClubAbbreviation };

/**
 * Get all topics (Paginated)
 */
export const getTopics = async (page = 1, limit = 50): Promise<Topic[]> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching topics:', error);
        return [];
    }

    return data || [];
};

/**
 * Get topic by slug
 */
export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching topic:', error);
        return undefined;
    }

    return data || undefined;
};

/**
 * Get all active topics
 */
export const getAllTopics = async (): Promise<Topic[]> => {
    return getTopics();
};

/**
 * Get topics by type (club, player, competition, match, transfer)
 */
export const getTopicsByType = async (type: TopicType): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('follower_count', { ascending: false });

    if (error) {
        console.error('Error fetching topics by type:', error);
        return [];
    }

    return data || [];
};

/**
 * Get players for a specific club (using topic_relationships)
 */
export const getPlayersByClub = async (clubId: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topic_relationships')
        .select(`
            child_topic:topics!topic_relationships_child_topic_id_fkey(*)
        `)
        .eq('parent_topic_id', clubId)
        .eq('relationship_type', 'plays_for');

    if (error) {
        console.error('Error fetching players by club:', error);
        return [];
    }

    // Extract the nested topic data and filter out nulls
    return (data?.map((rel: any) => rel.child_topic).filter(Boolean) || []) as Topic[];
};

/**
 * Get clubs by league
 */
export const getClubsByLeague = async (leagueName: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('type', 'club')
        .eq('is_active', true)
        .filter('metadata->>league', 'eq', leagueName)
        .order('title', { ascending: true });

    if (error) {
        console.error('Error fetching clubs by league:', error);
        return [];
    }

    return data || [];
};

/**
 * Get league topic by title
 */
export const getLeagueByTitle = async (title: string): Promise<Topic | null> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('type', 'league')
        .eq('title', title)
        .eq('is_active', true)
        .maybeSingle();

    if (error) {
        console.error('Error fetching league by title:', error);
        return null;
    }

    return data || null;
};

/**
 * Get all unique leagues
 */
export const getLeagues = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('metadata')
        .eq('type', 'club')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching leagues:', error);
        return [];
    }

    // Extract unique leagues from metadata
    const leagues = new Set<string>();
    data?.forEach((topic: any) => {
        const league = topic.metadata?.league;
        if (league) leagues.add(league);
    });

    return Array.from(leagues).sort();
};

/**
 * Get a player's club (using topic_relationships)
 */
export const getPlayerClub = async (playerId: string): Promise<Topic | null> => {
    const { data, error } = await supabase
        .from('topic_relationships')
        .select(`
            parent_topic:topics!topic_relationships_parent_topic_id_fkey(*)
        `)
        .eq('child_topic_id', playerId)
        .eq('relationship_type', 'plays_for')
        .maybeSingle();

    if (error) {
        console.error('Error fetching player club:', error);
        return null;
    }

    return (data?.parent_topic as Topic) || null;
};

/**
 * Get fixtures for a club (home or away)
 */
export const getClubFixtures = async (clubId: string): Promise<any[]> => {
    // Only fetch fixtures from last 6 months onwards (captures current season + upcoming)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await supabase
        .from('fixtures')
        .select(`
            *,
            home_team:topics!fixtures_home_team_id_fkey(id, title, slug, metadata),
            away_team:topics!fixtures_away_team_id_fkey(id, title, slug, metadata),
            competition:topics!fixtures_competition_id_fkey(id, title, slug, metadata)
        `)
        .or(`home_team_id.eq.${clubId},away_team_id.eq.${clubId}`)
        .gte('date', sixMonthsAgo.toISOString())
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching club fixtures:', error);
        return [];
    }

    return data || [];
};

/**
 * Get standings for a league
 */
export const getLeagueTable = async (leagueId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('league_standings')
        .select(`
            *,
            team:topics!league_standings_team_id_fkey(id, title, slug, metadata)
        `)
        .eq('league_id', leagueId)
        .order('position', { ascending: true }); // Fixed: rank -> position

    if (error) {
        console.error('Error fetching league table:', error);
        return [];
    }

    return data || [];
};

/**
 * Get standing for a specific club
 */
export const getClubStanding = async (clubId: string): Promise<any | null> => {
    const { data, error } = await supabase
        .from('league_standings')
        .select(`
            *,
            team:topics!league_standings_team_id_fkey(id, title, slug, metadata)
        `)
        .eq('team_id', clubId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching club standing:', error);
        return null;
    }

    return data || null;
};

/**
 * Check if a league is a continental competition (Champions League, Europa League)
 * These leagues are special - clubs don't "belong" to them, they only have fixtures
 * Uses metadata.competition_type instead of hardcoded slugs for maintainability
 */
export const isContinentalLeague = (league: { metadata?: any; slug?: string }): boolean => {
    // Primary check: metadata.competition_type
    if (league.metadata?.competition_type === 'continental') {
        return true;
    }

    // Fallback: check slug (for backwards compatibility during migration)
    const continentalSlugs = ['uefa-champions-league', 'uefa-europa-league'];
    return league.slug ? continentalSlugs.includes(league.slug) : false;
};

/**
 * Get fixtures for a continental league (Champions League, Europa League, etc.)
 * Since clubs don't belong to these leagues, we fetch by competition_id
 */
export const getContinentalLeagueFixtures = async (leagueId: string): Promise<any[]> => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await supabase
        .from('fixtures')
        .select(`
            *,
            home_team:topics!fixtures_home_team_id_fkey(id, title, slug, metadata),
            away_team:topics!fixtures_away_team_id_fkey(id, title, slug, metadata),
            competition:topics!fixtures_competition_id_fkey(id, title, slug, metadata)
        `)
        .eq('competition_id', leagueId)
        .gte('date', sixMonthsAgo.toISOString())
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching continental league fixtures:', error);
        return [];
    }

    return data || [];
};


/**
 * Get all players belonging to clubs in Allowed Leagues (Frontend visibility filter)
 */
export const getVisiblePlayers = async (): Promise<Topic[]> => {
    // 1. Get all allowed clubs
    // Note: This relies on metadata->league matching the constant strings
    // AND filtering locally if needed, but we can try DB filter if keys match.
    // 'metadata->>league' eq 'English Premier League' etc.
    // Since we have multiple, using .in() with json arrow is best.

    // Fetch club IDs first
    const { data: clubs, error: clubError } = await supabase
        .from('topics')
        .select('id')
        .eq('type', 'club')
        .eq('is_active', true)
    // Helper to construct OR filter? or IN?
    // Supabase doesn't support .in('metadata->>league', [...]) easily on all PG versions via PostgREST?
    // It does support generic filter.
    // Let's just fetch all clubs and filter in JS to be safe and simple (only expected ~200 clubs total).

    if (clubError || !clubs) return [];

    // Filter JS side for safety and exact match
    // Reuse getAllTopics logic effectively or just fetch metadata
    const { data: allClubs } = await supabase.from('topics').select('id, metadata').eq('type', 'club');

    if (!allClubs) return [];

    const allowedClubIds = allClubs
        .filter(c => ALLOWED_LEAGUES.includes((c.metadata as any)?.league))
        .map(c => c.id);

    if (allowedClubIds.length === 0) return [];

    // 2. Fetch players linked to these clubs
    // We use topic_relationships
    const { data: relations, error: relError } = await supabase
        .from('topic_relationships')
        .select('child_topic_id')
        .eq('relationship_type', 'plays_for')
        .in('parent_topic_id', allowedClubIds);

    if (relError || !relations) return [];

    const playerIds = relations.map(r => r.child_topic_id);

    if (playerIds.length === 0) return [];

    // 3. Fetch full player topics
    const { data: players, error: playerError } = await supabase
        .from('topics')
        .select('*')
        .in('id', playerIds)
        .eq('is_active', true)
        .order('follower_count', { ascending: false });

    if (playerError) return [];

    return players || [];
};
