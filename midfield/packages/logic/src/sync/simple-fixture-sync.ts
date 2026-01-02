
import { SupabaseClient } from "@supabase/supabase-js";
import { TheSportsDBClient } from "./client";

// Core leagues to track (national + continental)
const LEAGUES = [
    '4328', '4335', '4332', '4331', '4334', // EPL, La Liga, Serie A, Ligue 1, Bundesliga
    '4480', '4481' // Champions League, Europa League
];

// === DAILY SCHEDULE SYNC (Run at 6 AM) ===
// === DAILY SCHEDULE SYNC (Run at 6 AM) ===
export async function syncDailySchedules(supabase: SupabaseClient, apiClient: TheSportsDBClient, targetLeagues: string[] = LEAGUES) {
    // Dynamically calculate season (Aug-July splits)
    // Example: Dec 2025 -> 2025-2026, Aug 2026 -> 2026-2027
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const currentSeason = month >= 7 // August (7) onwards is new season
        ? `${year}-${year + 1}`
        : `${year - 1}-${year}`;

    console.log(`Starting daily schedule sync for season ${currentSeason}...`);

    // 1. Pre-fetch all clubs to minimize DB lookups (Safe for current scale of ~100-500 clubs)
    const { data: allClubs } = await supabase.from('topics')
        .select('id, metadata')
        .eq('type', 'club');

    // Map TSDB_ID -> UUID
    const clubMap = new Map<string, string>();
    if (allClubs) {
        allClubs.forEach((c: any) => {
            const tid = c.metadata?.external?.thesportsdb_id;
            if (tid) clubMap.set(tid, c.id);
        });
    }

    // Process each league
    for (const leagueId of targetLeagues) {
        try {
            console.log(`Processing league ${leagueId}...`);

            // Get League UUID
            const { data: leagueTopic } = await supabase.from('topics')
                .select('id')
                .eq('type', 'league')
                .contains('metadata', { external: { thesportsdb_id: leagueId } })
                .single();

            if (!leagueTopic) {
                console.error(`League ${leagueId} not found in DB. Skipping.`);
                continue;
            }

            const schedule = await apiClient.getLeagueSchedule(leagueId, currentSeason);
            const events = (schedule as any).schedule || schedule.events || [];
            if (events.length === 0) continue;

            console.log(`Fetched ${events.length} events for league ${leagueId}.`);

            // Identify missing teams
            const teamTsdbIds = new Set<string>();
            events.forEach((e: any) => {
                if (e.idHomeTeam) teamTsdbIds.add(e.idHomeTeam);
                if (e.idAwayTeam) teamTsdbIds.add(e.idAwayTeam);
            });

            // Create Stubs for missing teams (Parallelized)
            const missingIds = Array.from(teamTsdbIds).filter(id => !clubMap.has(id));
            if (missingIds.length > 0) {
                console.log(`Found ${missingIds.length} missing teams in league ${leagueId}. Creating stubs...`);

                // Process stubs in parallel to avoid timeouts
                const newIds = await Promise.all(missingIds.map(async (missingId) => {
                    const ev = events.find((e: any) => e.idHomeTeam === missingId || e.idAwayTeam === missingId);
                    const name = ev?.idHomeTeam === missingId ? ev.strHomeTeam : ev.strAwayTeam;

                    try {
                        const newId = await createStub(supabase, missingId, name);
                        if (newId) return { id: missingId, uuid: newId };
                    } catch (err) {
                        console.error(`Failed to create stub for ${name} (${missingId})`, err);
                    }
                    return null;
                }));

                // Update map
                newIds.forEach(item => {
                    if (item) clubMap.set(item.id, item.uuid);
                });
            }

            // Prepare Payloads
            const payloads = events.map((e: any) => {
                const homeId = clubMap.get(e.idHomeTeam);
                const awayId = clubMap.get(e.idAwayTeam);
                if (!homeId || !awayId) return null;

                return {
                    id: parseInt(e.idEvent),
                    date: e.dateEvent + 'T' + (e.strTime || '00:00:00'),
                    home_team_id: homeId,
                    away_team_id: awayId,
                    home_team_name: e.strHomeTeam, // Fallback for display
                    away_team_name: e.strAwayTeam, // Fallback for display
                    home_team_badge: e.strHomeTeamBadge || e.strHomeBadge,
                    away_team_badge: e.strAwayTeamBadge || e.strAwayBadge,
                    competition_id: leagueTopic.id,
                    venue: e.strVenue,
                    home_score: e.intHomeScore ? parseInt(e.intHomeScore) : null,
                    away_score: e.intAwayScore ? parseInt(e.intAwayScore) : null,
                    status: normalizeStatus(e.strStatus),
                    gameweek: e.intRound ? parseInt(e.intRound) : null
                };
            }).filter((p: any) => p !== null);

            // Batch Upsert
            if (payloads.length > 0) {
                const { error } = await supabase.from('fixtures').upsert(payloads, { onConflict: 'id' });
                if (error) console.error(`Error saving fixtures for league ${leagueId}:`, error);
                else console.log(`Saved ${payloads.length} fixtures.`);
            }

        } catch (err) {
            console.error(`Failed to sync league ${leagueId}:`, err);
        }
    }

    console.log('Daily sync complete');
}

// === REAL-TIME LIVESCORE SYNC (Run every 1 min) ===
export async function updateLivescores(supabase: SupabaseClient, apiClient: TheSportsDBClient) {
    // 1. Adaptive Check: Are there any matches currently LIVE or starting/finishing soon?
    const now = new Date();

    // Window: 2.5 hours ago (match started) to 30 mins from now (match starting)
    // This captures all potential live games + pre-match buildup
    const startWindow = new Date(now.getTime() - 150 * 60 * 1000);
    const endWindow = new Date(now.getTime() + 30 * 60 * 1000);

    const { data: activeFixtures } = await supabase
        .from('fixtures')
        .select('competition_id, status')
        .gte('date', startWindow.toISOString())
        .lte('date', endWindow.toISOString())
        .not('status', 'eq', 'FT'); // Only check if not already finished

    // If no matches are active, DO NOTHING (save API calls)
    if (!activeFixtures || activeFixtures.length === 0) {
        console.log('No active fixtures to poll. Skipping.');
        return;
    }

    const activeLeagues = new Set(activeFixtures.map(f => f.competition_id));
    console.log(`Polling livescores for leagues: ${Array.from(activeLeagues).join(', ')}`);

    for (const leagueId of activeLeagues) {
        try {
            const livescores = await apiClient.getLivescores(leagueId);

            if (livescores.events && livescores.events.length > 0) {
                // Batch updates into a single Upsert payload
                const updates = livescores.events
                    .filter((event: any) => event.idEvent)
                    .map((event: any) => ({
                        id: parseInt(event.idEvent),
                        status: normalizeStatus(event.strStatus),
                        home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
                        away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
                        updated_at: new Date().toISOString() // Track when we last saw it alive
                    }));

                if (updates.length > 0) {
                    const { error } = await supabase
                        .from('fixtures')
                        .upsert(updates, { onConflict: 'id', ignoreDuplicates: false });

                    if (error) {
                        console.error(`Error batch updating fixtures for league ${leagueId}:`, error);
                    } else {
                        console.log(`Updated ${updates.length} livescores for league ${leagueId}`);
                    }
                }
            }
        } catch (err) {
            console.error(`Failed to poll livescores for league ${leagueId}:`, err);
        }
    }
}


// === HELPERS ===

// Strict Status Enum Mapping
function normalizeStatus(apiStatus: string | null): 'NS' | 'LIVE' | 'HT' | 'FT' | 'PST' | 'ABD' {
    if (!apiStatus) return 'NS';

    const s = apiStatus.toLowerCase();

    // Check for finished states (must come before live detection)
    if (s.includes('finished') || s === 'ft' || s === 'aet' || s === 'pen' || s === 'after extra time' || s === 'after penalties') return 'FT';

    // Check for not started
    if (s.includes('not started') || s === 'ns' || s === 'time to be defined' || s === 'tbd') return 'NS';

    // Check for postponed/cancelled (must come before generic live fallback)
    if (s.includes('postponed') || s.includes('cancelled') || s.includes('canceled')) return 'PST';

    // Check for abandoned/suspended
    if (s.includes('abandoned') || s.includes('suspended') || s.includes('interrupted')) return 'ABD';

    // Check for halftime
    if (s === 'ht' || s.includes('halftime') || s.includes('half time') || s === 'break') return 'HT';

    // Live indicators (1H, 2H, ET, minute numbers, etc.)
    // If it's none of the above but has content, assume it's live
    return 'LIVE';
}

async function createStub(supabase: SupabaseClient, tsdbId: string, teamName: string): Promise<string | null> {
    console.log(`Creating Stub Club: ${teamName} (${tsdbId})`);

    const baseSlug = slugify(teamName || `club-${tsdbId}`);
    let slug = baseSlug;

    // Check if topic with this slug already exists
    const { data: existing } = await supabase.from('topics').select('id').eq('slug', slug).single();

    if (existing) {
        console.log(`Stub creation: Slug ${slug} already exists. Using existing topic ${existing.id}.`);
        // Ideally we would update the metadata here to include the TSDB ID so we don't miss it next time
        // But for now, returning the ID is enough to unblock the fixture sync
        return existing.id;
    }

    const stub = {
        type: 'club',
        title: teamName || 'Unknown Club',
        slug: slug,
        metadata: {
            external: { thesportsdb_id: tsdbId, source: 'stub' },
            is_stub: true
        },
        is_active: true
    };

    const { data: newClub, error } = await supabase.from('topics').insert(stub).select('id').single();

    if (error) {
        console.error(`Failed to create stub for ${teamName}:`, error);
        // Fallback: try one more time with random suffix just to save the fixture
        const retrySlug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        const { data: retryClub, error: retryError } = await supabase.from('topics').insert({ ...stub, slug: retrySlug }).select('id').single();

        if (retryError) {
            console.error(`Retry failed for ${teamName}:`, retryError);
            return null;
        }
        return retryClub.id;
    }

    return newClub.id;
}

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function updateFixtureStatus(supabase: SupabaseClient, event: any) {
    if (!event.idEvent) return;

    const status = normalizeStatus(event.strStatus);

    const update = {
        status: status,
        home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
        away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
    };

    await supabase
        .from('fixtures')
        .update(update)
        .eq('id', event.idEvent);
}

