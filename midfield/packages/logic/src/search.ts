import { createClient } from "@supabase/supabase-js"; // Using generic client for logic package, need to make sure we handle this env var or client injection
// Actually, better to accept the client as an argument or use a shared client creator if possible. 
// For now, let's stick to the pattern of creating a client if needed, but since this is shared logic, it might run on client or server.
// Best pattern: Accept supabase client as Dependency Injection to be platform agnostic.

// Best pattern: Accept supabase client as Dependency Injection to be platform agnostic.

import { ALLOWED_LEAGUES } from "./constants";

// Helper: Remove accents/diacritics for normalization
function removeDiacritics(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Helper: Lightweight Levenshtein distance for typos
function getLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// In-memory cache for topics (avoids re-fetching on every keystroke)
let topicsCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

// Fetch all topics for search with caching
async function getAllTopicsForSearch(supabase: any) {
    const now = Date.now();
    if (topicsCache && (now - cacheTimestamp) < CACHE_TTL) {
        return topicsCache;
    }

    // Include relationships to determine player's club league
    const { data, error } = await supabase
        .from('topics')
        .select(`
            id, title, slug, type, metadata,
            relations:topic_relationships!topic_relationships_child_topic_id_fkey(
                relationship_type,
                parent_topic:topics!topic_relationships_parent_topic_id_fkey(metadata)
            )
        `)
        .eq('is_active', true)
        .order('title', { ascending: true });

    if (error) {
        console.error('Error fetching topics:', error);
        return topicsCache || [];
    }

    // Process data to attach 'derivedLeague' for filtering
    const processed = (data || []).map((t: any) => {
        let derivedLeague: string | null = null;
        if (t.type === 'club') {
            derivedLeague = t.metadata?.league;
        } else if (t.type === 'player') {
            const clubRel = (t.relations || []).find((r: any) => r.relationship_type === 'plays_for');
            derivedLeague = (clubRel?.parent_topic?.metadata as any)?.league;
        }
        return { ...t, derivedLeague };
    });

    topicsCache = processed;
    cacheTimestamp = now;
    return topicsCache;
}

export async function searchTopicsLogic(supabase: any, query: string, type?: string) {
    if (!query || query.length < 2) return [];

    const all = await getAllTopicsForSearch(supabase) || [];
    const rawQuery = query.toLowerCase().trim();
    const normalizedQuery = removeDiacritics(rawQuery);
    const queryLen = rawQuery.length;

    // Score each topic
    const scored: { topic: any; score: number }[] = [];

    for (const topic of all) {
        // Early type filter
        if (type && topic.type !== type) continue;

        // VISIBILITY FILTER
        if (topic.type === 'club') {
            // Allow club if derivedLeague is in ALLOWED or if derivedLeague is missing (might be a stub/new club)
            if (topic.derivedLeague && !ALLOWED_LEAGUES.includes(topic.derivedLeague)) continue;
        } else if (topic.type === 'player') {
            // Players require a club in allowed leagues  
            if (!topic.derivedLeague || !ALLOWED_LEAGUES.includes(topic.derivedLeague)) continue;
        } else if (topic.type === 'league') {
            const isContinental = topic.metadata?.competition_type === 'continental';
            const isAllowed = ALLOWED_LEAGUES.includes(topic.title) || ALLOWED_LEAGUES.includes(topic.metadata?.league);
            // Allow all continental leagues + allowed national leagues
            if (!isContinental && !isAllowed) continue;
        }

        const rawTitle = topic.title.toLowerCase();
        const normalizedTitle = removeDiacritics(rawTitle);
        let score = 0;

        // 1. Exact full match (highest)
        if (rawTitle === rawQuery || normalizedTitle === normalizedQuery) {
            score = 100;
        }
        // 2. Starts with query (very high - prefix match)
        else if (rawTitle.startsWith(rawQuery) || normalizedTitle.startsWith(normalizedQuery)) {
            score = 95;
        }
        // 3. Word starts with query (high - e.g. "Manchester United" matches "uni")
        else if (rawTitle.split(/\s+/).some((w: string) => w.startsWith(rawQuery)) ||
            normalizedTitle.split(/\s+/).some((w: string) => w.startsWith(normalizedQuery))) {
            score = 85;
        }
        // 4. Contains substring
        else if (rawTitle.includes(rawQuery) || normalizedTitle.includes(normalizedQuery)) {
            score = 75;
        }
        // 5. Fuzzy match (for typos) - more tolerant
        else if (queryLen >= 3) {
            // For short titles, compare directly; for long titles, check each word
            const words = normalizedTitle.split(/\s+/);
            let bestDist = Infinity;

            // Check against each word
            for (const word of words) {
                if (Math.abs(word.length - queryLen) <= 3) {
                    const dist = getLevenshteinDistance(word, normalizedQuery);
                    bestDist = Math.min(bestDist, dist);
                }
            }

            // Also check against full title for multi-word queries
            const fullDist = getLevenshteinDistance(normalizedTitle, normalizedQuery);
            bestDist = Math.min(bestDist, fullDist);

            // Allow up to 40% of query length as errors, minimum 2
            const maxDist = Math.max(2, Math.floor(queryLen * 0.4));
            if (bestDist <= maxDist) {
                score = 60 - bestDist * 5; // Lower score for more errors
            }
        }

        if (score >= 50) {
            scored.push({ topic, score });
        }
    }

    // Sort by score (best first) and take top 8
    const results = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(item => item.topic);

    // Enrich player results with club info
    if (results.length > 0) {
        const playerIds = results.filter((t: any) => t.type === 'player').map((t: any) => t.id);

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

            // Create a map of player ID -> club info
            const clubMap = new Map();
            (relationships || []).forEach((rel: any) => {
                if (rel.parent_topic) {
                    clubMap.set(rel.child_topic_id, {
                        name: rel.parent_topic.title,
                        badge_url: rel.parent_topic.metadata?.badge_url
                    });
                }
            });

            // Enrich results
            return results.map((topic: any) => {
                if (topic.type === 'player' && clubMap.has(topic.id)) {
                    return { ...topic, clubInfo: clubMap.get(topic.id) };
                }
                return topic;
            });
        }
    }

    return results;
}
