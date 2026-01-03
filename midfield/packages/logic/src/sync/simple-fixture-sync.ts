import { SupabaseClient } from "@supabase/supabase-js";
import { TheSportsDBClient } from "./client";
import pLimit from "p-limit";

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
    const clubMetaMap = new Map<string, any>(); // UUID -> Metadata

    if (allClubs) {
        allClubs.forEach((c: any) => {
            const tid = c.metadata?.external?.thesportsdb_id;
            if (tid) {
                clubMap.set(tid, c.id);
                clubMetaMap.set(c.id, c.metadata);
            }
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
                    const badge = ev?.idHomeTeam === missingId ? (ev.strHomeTeamBadge || ev.strHomeBadge) : (ev.strAwayTeamBadge || ev.strAwayBadge);

                    try {
                        const newId = await createStub(supabase, missingId, name, 'club', badge);
                        if (newId) return { id: missingId, uuid: newId };
                    } catch (err) {
                        console.error(`Failed to create stub for ${name} (${missingId})`, err);
                    }
                    return null;
                }));

                // Update map
                newIds.forEach(item => {
                    if (item) {
                        clubMap.set(item.id, item.uuid);
                        // Add to meta map so we don't try to "heal" it immediately (it's fresh)
                        clubMetaMap.set(item.uuid, { is_stub: true, badge_url: true }); // optimize
                    }
                });
            }

            // Heal Existing Stubs (Missing Badges)
            const stubsToUpdate = new Map<string, string>(); // UUID -> BadgeURL
            const stubsToFetch = new Set<string>(); // UUIDs of stubs with NO badge in event either

            events.forEach((e: any) => {
                const homeId = clubMap.get(e.idHomeTeam);
                const awayId = clubMap.get(e.idAwayTeam);

                // Check Home
                if (homeId) {
                    const meta = clubMetaMap.get(homeId);
                    const badge = e.strHomeTeamBadge || e.strHomeBadge;
                    if (meta?.is_stub && !meta.badge_url) {
                        if (badge) stubsToUpdate.set(homeId, badge);
                        else stubsToFetch.add(homeId);
                    }
                }
                // Check Away
                if (awayId) {
                    const meta = clubMetaMap.get(awayId);
                    const badge = e.strAwayTeamBadge || e.strAwayBadge;
                    if (meta?.is_stub && !meta.badge_url) {
                        if (badge) stubsToUpdate.set(awayId, badge);
                        else stubsToFetch.add(awayId);
                    }
                }
            });

            // 1. Direct Updates (Badge found in Event)
            if (stubsToUpdate.size > 0) {
                console.log(`Healing ${stubsToUpdate.size} stubs with badges from event data...`);
                await Promise.all(Array.from(stubsToUpdate.entries()).map(async ([uuid, badgeUrl]) => {
                    const { error } = await supabase.from('topics').update({
                        metadata: { ...clubMetaMap.get(uuid), badge_url: badgeUrl }
                    }).eq('id', uuid);
                    if (error) console.error(`Failed to heal stub ${uuid}`, error);
                }));
            }

            // 2. Active Fetch Updates (Badge NOT in Event, but Stub needs it)
            // Only process if we haven't just updated it in step 1 (Sets are distinct logic wise, but let's check)
            // stubsToFetch only added if NO badge in event.
            if (stubsToFetch.size > 0) {
                console.log(`Proactively fetching badges for ${stubsToFetch.size} active stubs (API Lookup)...`);
                for (const uuid of stubsToFetch) {
                    const meta = clubMetaMap.get(uuid);
                    const tsdbId = meta?.external?.thesportsdb_id;
                    if (!tsdbId) continue;

                    try {
                        // Rate Limit Protection: 1s delay
                        await new Promise(r => setTimeout(r, 1000));

                        const team = await apiClient.lookupTeam(tsdbId);
                        const badge = (team as any)?.strTeamBadge || (team as any)?.strBadge;

                        if (badge) {
                            const { error } = await supabase.from('topics').update({
                                metadata: { ...meta, badge_url: badge }
                            }).eq('id', uuid);

                            if (!error) console.log(`   Healed stub ${uuid} via API`);
                            else console.error(`   Failed to save API badge for ${uuid}`, error);
                        }
                    } catch (err) {
                        console.error(`   API Lookup failed for stub ${uuid}`, err);
                    }
                }
            }

            // Prepare Payloads
            const payloads = events.map((e: any) => {
                const homeId = clubMap.get(e.idHomeTeam);
                const awayId = clubMap.get(e.idAwayTeam);
                if (!homeId || !awayId) return null;

                const dateStr = e.dateEvent + 'T' + (e.strTime || '00:00:00');

                // Status Normalization & Safety Guard
                let status = normalizeStatus(e.strStatus);
                const matchDate = new Date(dateStr);
                const now = new Date();
                const hoursSinceStart = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60);

                // Auto-fix "Stuck" matches: If LIVE/HT but > 4 hours old, force FT
                if (['LIVE', 'HT', 'INT', 'BREAK', 'PEN', 'ET', '1H', '2H'].includes(status) && hoursSinceStart > 4) {
                    console.warn(`⚠️ Auto-correcting STUCK match ${e.strHomeTeam} vs ${e.strAwayTeam} (ID: ${e.idEvent}) from ${status} to FT (> ${hoursSinceStart.toFixed(1)}h old)`);
                    status = 'FT';
                }

                return {
                    id: parseInt(e.idEvent),

                    date: dateStr, // Keep original string or normalized? DB expects ISO likely?
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
                    status: status,
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
    const now = new Date();
    // --- STEP 0: SANITATION "THE GRIM REAPER" ---
    // Unconditionally force-finish any match that is > 4 hours old but still marked LIVE/HT.
    // This runs BEFORE any window checks to ensure nothing escapes.
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
    const { data: zombies } = await supabase
        .from('fixtures')
        .select('id, status, date, home_team_name, away_team_name')
        .in('status', ['LIVE', 'HT', 'INT', 'BREAK', 'PEN', 'ET', '1H', '2H'])
        .lt('date', fourHoursAgo);

    if (zombies && zombies.length > 0) {
        console.warn(`[Grim Reaper] 💀 Killing ${zombies.length} STUCK matches (>4h old)...`);
        zombies.forEach(z => console.log(`   ⚰️  Buried: ${z.home_team_name} vs ${z.away_team_name} (${z.status})`));

        await supabase
            .from('fixtures')
            .update({ status: 'FT', updated_at: now.toISOString() })
            .in('id', zombies.map(z => z.id));
    }

    // Also reset "Future Bogies" (LIVE but > 4h in future)
    const futureFourHours = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    const { data: bogies } = await supabase.from('fixtures').select('id').in('status', ['LIVE', 'HT']).gt('date', futureFourHours);
    if (bogies && bogies.length > 0) {
        console.log(`[Grim Reaper] Resetting ${bogies.length} false-future-live matches to NS...`);
        await supabase.from('fixtures').update({ status: 'NS', updated_at: now.toISOString() }).in('id', bogies.map(b => b.id));
    }

    // --- STEP 1: ACTIVE POLL ---
    // Expanded window to 12 hours backward to catch matches that finished earlier today
    const startWindow = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
    const endWindow = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins from now

    const { data: activeFixtures } = await supabase
        .from('fixtures')
        .select('id, competition_id, status, date')
        .gte('date', startWindow.toISOString())
        .lte('date', endWindow.toISOString())
        .not('status', 'eq', 'FT'); // Only check if not already finished

    // If no matches are active, DO NOTHING (save API calls)
    if (!activeFixtures || activeFixtures.length === 0) {
        console.log('No active fixtures to poll. Skipping.');
        return;
    }


    // 2. SAFETY NET: Check for "Stuck" matches (NS/LIVE but in the past) or "Future-False-Lives"
    // MOVED TO STEP 0 (Grim Reaper) - Removed from here


    // C. Traditional Stuck Logic (for deep repair sync)
    // Started > 2 hours ago logic for re-checking API
    const { data: stuckFixtures } = await supabase
        .from('fixtures')
        .select('id, competition_id, status')
        .lt('date', new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()) // Started > 2 hours ago
        .neq('status', 'FT')
        .neq('status', 'ABD')
        .neq('status', 'PST');

    // Combine active leagues and track expected fixture IDs per league for Vanish Protocol
    const activeLeagues = new Set<string>();
    const expectedFixturesByLeague = new Map<string, Set<number>>(); // UUID -> Set<FixtureID>

    const registerExpected = (f: any) => {
        activeLeagues.add(f.competition_id);
        if (!expectedFixturesByLeague.has(f.competition_id)) {
            expectedFixturesByLeague.set(f.competition_id, new Set());
        }
        expectedFixturesByLeague.get(f.competition_id)?.add(f.id);
    };

    if (activeFixtures) activeFixtures.forEach(registerExpected);

    // For stuck matches, we ALSO mark them for Deep Repair
    const stuckLeagues = new Set<string>();
    if (stuckFixtures) {
        stuckFixtures.forEach(f => {
            registerExpected(f);
            stuckLeagues.add(f.competition_id);
        });
    }

    if (activeLeagues.size === 0) {
        console.log('No active or stuck fixtures. Skipping.');
        return;
    }

    // CRITICAL FIX: Resolve UUIDs -> TSDB_IDs
    // The API requires the numeric TSDB ID (e.g. 4332), not our UUID
    const { data: leagueTopics } = await supabase
        .from('topics')
        .select('id, metadata')
        .in('id', Array.from(activeLeagues));

    const leagueIdMap = new Map<string, string>(); // UUID -> TSDB_ID
    if (leagueTopics) {
        leagueTopics.forEach((t: any) => {
            const externalId = t.metadata?.external?.thesportsdb_id;
            if (externalId) {
                leagueIdMap.set(t.id, externalId);
            }
        });
    }

    console.log(`Polling livescores for leagues (UUID -> TSDB):`);
    leagueIdMap.forEach((tsdb, uuid) => console.log(`${uuid} -> ${tsdb}`));

    // Iterate through UUIDs but use TSDB IDs for API
    for (const uuid of activeLeagues) {
        const tsdbId = leagueIdMap.get(uuid);
        if (!tsdbId) {
            console.warn(`Could not resolve TSDB ID for league UUID ${uuid}. Skipping.`);
            continue;
        }

        try {
            // A. Standard Livescore Poll
            const livescores = await apiClient.getLivescores(tsdbId);
            let eventsToUpdate = livescores.events || [];

            // C. VANISH PROTOCOL: Check for active matches that vanished from Live Feed
            const foundEventIds = new Set(eventsToUpdate.map((e: any) => parseInt(e.idEvent)));
            const expectedIds = expectedFixturesByLeague.get(uuid) || new Set();

            const missingIds = Array.from(expectedIds).filter(id => !foundEventIds.has(id));

            if (missingIds.length > 0) {
                console.log(`Vanish Protocol: ${missingIds.length} matches missing from live feed for league ${tsdbId}. Hunting them down...`);

                // Granular Sync for Missing Matches
                const recoveredEvents = await Promise.all(
                    missingIds.map(async (id) => {
                        try {
                            return await apiClient.lookupEvent(id.toString());
                        } catch (e) {
                            console.error(`Failed to lookup event ${id}:`, e);
                            return null;
                        }
                    })
                );

                const validRecovered = recoveredEvents.filter(e => e !== null);
                if (validRecovered.length > 0) {
                    console.log(`Recovered ${validRecovered.length} vanished matches.`);
                    eventsToUpdate = [...eventsToUpdate, ...validRecovered];
                }
            }

            // B. Deep Repair Poll (for stuck leagues)
            // Still useful as a fallback if individual lookup fails or for bulk catch-up
            if (stuckLeagues.has(uuid)) {
                // ... (Deep Repair Logic handled by Vanish Protocol effectively now, but harmless to verify)
                // We can skip heavy deep sync if Vanish Protocol covered everything, but let's keep it for safety for now
                // Actually, let's optimize: Only run deep sync if Vanish Protocol didn't find everything or if specifically requested.
                // Given Vanish Protocol is granular, it's better. We'll leave Deep Sync logic as robust backup for now.

                // Reuse existing Deep Sync logic for robustness
                console.log(`Performing deep repair sync for league ${tsdbId} (UUID: ${uuid})...`);
                const [pastEvents, nextEvents] = await Promise.all([
                    apiClient.getPastLeagueEvents(tsdbId),
                    apiClient.getUpcomingFixtures(tsdbId)
                ]);

                const relevantEvents = [
                    ...(Array.isArray(pastEvents) ? pastEvents : []),
                    ...(nextEvents?.events || [])
                ];

                if (relevantEvents.length > 0) {
                    const existingIds = new Set(eventsToUpdate.map((e: any) => e.idEvent));
                    const newEvents = relevantEvents.filter((e: any) => !existingIds.has(e.idEvent));
                    eventsToUpdate = [...eventsToUpdate, ...newEvents];
                }
            }

            if (eventsToUpdate.length > 0) {
                // Deduplicate eventsToUpdate based on idEvent
                const uniqueEvents = new Map();
                eventsToUpdate.forEach((e: any) => {
                    if (e.idEvent) uniqueEvents.set(e.idEvent, e);
                });

                const finalEvents = Array.from(uniqueEvents.values());

                // Batch updates into a single Upsert payload
                const potentialUpdates = finalEvents
                    .filter((event: any) => event.idEvent)
                    .map((event: any) => {
                        let status = normalizeStatus(event.strStatus);

                        // GRIM REAPER GUARD: Ensure we don't resurrect zombies if API still reports LIVE for old matches
                        if (event.dateEvent) {
                            const dateStr = event.dateEvent + 'T' + (event.strTime || '00:00:00');
                            const matchDate = new Date(dateStr);
                            const ageHours = (new Date().getTime() - matchDate.getTime()) / (1000 * 60 * 60);

                            // Expanded status check for all "active" states
                            if (['LIVE', 'HT', 'INT', 'BREAK', 'PEN', 'ET', '1H', '2H'].includes(status) && ageHours > 4) {
                                console.warn(`[Grim Reaper] 🛡️ Blocked resurrection of zombie match ${event.strEvent || event.idEvent} (${ageHours.toFixed(1)}h old). Forcing FT.`);
                                status = 'FT';
                            }
                        }

                        return {
                            id: parseInt(event.idEvent),
                            status: status,
                            home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
                            away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
                            updated_at: new Date().toISOString() // Track when we last saw it alive
                        };
                    });

                if (potentialUpdates.length > 0) {
                    // CRITICAL: We must only update fixtures that EXIST.
                    // The API might return past events that we never synced (or deleted).
                    // Trying to upsert them without home_team_id/etc will violate constraints.

                    const idsToCheck = potentialUpdates.map((u: any) => u.id);
                    const { data: existingFixtures } = await supabase
                        .from('fixtures')
                        .select('id')
                        .in('id', idsToCheck);

                    const existingIds = new Set(existingFixtures?.map(f => f.id));
                    const validUpdates = potentialUpdates.filter((u: any) => existingIds.has(u.id));

                    if (validUpdates.length > 0) {
                        console.log(`Updating ${validUpdates.length} fixtures for league ${tsdbId}...`);

                        // Switch to Iterative Update to avoid Upsert constraint issues
                        for (const update of validUpdates) {
                            const { error } = await supabase
                                .from('fixtures')
                                .update({
                                    status: update.status,
                                    home_score: update.home_score,
                                    away_score: update.away_score,
                                    updated_at: update.updated_at
                                })
                                .eq('id', update.id);

                            if (error) {
                                console.error(`Failed to update fixture ${update.id}:`, error);
                            }
                        }
                        console.log(`Iteration complete for league ${tsdbId}`);
                    } else {
                        console.log(`No matching existing fixtures to update for league ${tsdbId}`);
                    }
                }
            }
        } catch (err) {
            console.error(`Failed to sync league ${tsdbId}:`, err);
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

    // Live indicators (Explicit check)
    // Common: 1H, 2H, ET, Pen, integers (minutes), 'In Progress'
    if (s === '1h' || s === '2h' || s === 'et' || s === 'pen' || s === 'live' || s === 'in progress') return 'LIVE';

    // Check for minute markers (e.g. "34'", "90+2")
    if (/\d+'/.test(s) || /^\d+$/.test(s)) return 'LIVE';

    // Default to Not Started if unknown (Safer than defaulting to Live)
    return 'NS';
}


/**
 * Syncs schedules for specific supported clubs across ALL their competitions.
 * This ensures we capture matches in Cups/Tournaments that aren't in our main synced leagues list.
 */
export async function syncClubSchedules(
    supabase: SupabaseClient,
    apiClient: TheSportsDBClient
) {
    console.log('--- Starting Club-Centric Schedule Sync ---');

    // 1. Get ONLY the Core 96 Supported Clubs
    // Since 'league_id' in metadata isn't reliable (was unknown in audit), 
    // we must rely on a hardcoded list of IDs or a specific query if we had a flag.
    // For now, to be absolutely safe as per user request, we will use the ALLOWED_LEAGUES constant
    // to filter, BUT we found the metadata is missing.

    // TEMPORARY FIX: We will fetch ALL 'club' topics, but then FILTER them against a 
    // Known "Core 96" list if we have it? No.
    // We will filter by checking if they are the "Main" clubs.
    // How do we know? 
    // Option A: We rely on the fact that "Core" clubs have full metadata (manager, stadium etc) and "Stubs" have `is_stub: true`.
    // But we just created stubs for non-core clubs.
    // 
    // BETTER: We only sync clubs that are NOT stubs. (`metadata->is_stub` is usually true for stubs).
    // And to be safer, we can check a hardcoded list of IDs if available, but "is_stub: false" is the best proxy for "Main Topic".

    const { data: clubs, error } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'club')
        .not('metadata->external->>thesportsdb_id', 'is', null);

    if (error || !clubs) {
        console.error('Failed to fetch clubs for sync:', error);
        return;
    }

    // FILTER: Strict Core 96 Definition
    // We only want clubs that are:
    // 1. Not Stubs
    // 2. Belong to one of the Core 5 Leagues (EPL, La Liga, Bundesliga, Serie A, Ligue 1)

    const CORE_LEAGUE_NAMES = [
        'English Premier League',
        'Spanish La Liga',
        'German Bundesliga',
        'Italian Serie A',
        'French Ligue 1'
    ];

    const coreClubs = clubs.filter(c => {
        if (c.metadata?.is_stub) return false;

        const leagueName = c.metadata?.league || '';
        return CORE_LEAGUE_NAMES.some(l => leagueName.includes(l));
    });

    console.log(`Found ${coreClubs.length} Core Clubs (filtered from ${clubs.length} total topics).`);

    // 2. Iterate and sync in Parallel Batches
    // RATE LIMIT OPTIMIZATION:
    // API Limit: 100 req/min (Premium).
    // Each club = 2 requests (Last + Next).
    // Target: ~1.6 req/sec (96 req/min) to stay safe.
    // Batch Size: 4 clubs (8 requests).
    // Delay: 5 seconds.
    // 8 reqs / 5s = 1.6 req/s.
    // 2. Iterate and sync using p-limit for steady throughput
    // API Limit: 100 req/min. Target ~1.6 req/sec.
    // Concurrency 2: Assuming 1s latency -> ~2 req/s. 
    // This slightly oversaturates but Retries will handle the overflow efficiently.
    const limit = pLimit(2);

    await Promise.all(coreClubs.map(club => limit(async () => {
        const tsdbId = club.metadata?.external?.thesportsdb_id;
        if (!tsdbId) return;

        try {
            // Fetch in Parallel (Last + Next)
            const [lastRes, nextRes] = await Promise.all([
                fetch(`https://www.thesportsdb.com/api/v1/json/${process.env.THESPORTSDB_API_KEY}/eventslast.php?id=${tsdbId}`).then(r => r.json()),
                fetch(`https://www.thesportsdb.com/api/v1/json/${process.env.THESPORTSDB_API_KEY}/eventsnext.php?id=${tsdbId}`).then(r => r.json())
            ]);

            const allEvents = [...(lastRes.results || []), ...(nextRes.events || [])];

            if (allEvents.length === 0) return;

            // Transform and Save
            const fixturesToUpsert = [];

            for (const event of allEvents) {
                const homeId = await resolveTeamId(supabase, event.idHomeTeam, event.strHomeTeam, event.strHomeTeamBadge);
                const awayId = await resolveTeamId(supabase, event.idAwayTeam, event.strAwayTeam, event.strAwayTeamBadge);
                const competitionId = await resolveLeagueId(supabase, event.idLeague, event.strLeague, event.strLeagueBadge);

                if (!homeId || !awayId || !competitionId) continue;

                let status = normalizeStatus(event.strStatus);

                // GRIM REAPER GUARD: Prevent resurrecting zombie matches in club-centric sync
                if (event.dateEvent) {
                    const dateStr = event.dateEvent + 'T' + (event.strTime || '00:00:00');
                    const matchDate = new Date(dateStr);
                    const ageHours = (new Date().getTime() - matchDate.getTime()) / (1000 * 60 * 60);

                    if (['LIVE', 'HT', 'INT', 'BREAK', 'PEN', 'ET', '1H', '2H'].includes(status) && ageHours > 4) {
                        console.warn(`[Grim Reaper] 🛡️ Blocked zombie in club-sync: ${event.strEvent || event.idEvent}`);
                        status = 'FT';
                    }
                }

                fixturesToUpsert.push({
                    id: parseInt(event.idEvent),
                    competition_id: competitionId,
                    date: event.dateEvent + 'T' + (event.strTime || '00:00:00'),
                    home_team_id: homeId,
                    away_team_id: awayId,
                    home_team_name: event.strHomeTeam,
                    away_team_name: event.strAwayTeam,
                    home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
                    away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
                    status: status,
                    venue: event.strVenue,
                    gameweek: event.intRound ? parseInt(event.intRound) : null
                });
            }

            if (fixturesToUpsert.length > 0) {
                const { error } = await supabase.from('fixtures').upsert(fixturesToUpsert, { onConflict: 'id' });
                if (error) console.error(`Error saving club fixtures for ${club.title}:`, error);
            }

        } catch (e) {
            console.error(`Error syncing club ${club.title}:`, e);
        }
    })));
}

// Reuse or duplicate helper to resolve/stub
async function resolveTeamId(supabase: SupabaseClient, tsdbId: string, name: string, badgeUrl?: string): Promise<string | null> {
    if (!tsdbId) return null;

    // 1. Try to find by metadata->external->thesportsdb_id
    const { data } = await supabase
        .from('topics')
        .select('id, metadata')
        .eq('metadata->external->>thesportsdb_id', tsdbId)
        .single();

    if (data) {
        // Opportunistic Heal: If it's a stub and missing badge, and we have one now
        const meta = data.metadata as any;
        if (meta?.is_stub && !meta.badge_url && badgeUrl) {
            // Non-blocking update
            supabase.from('topics').update({
                metadata: { ...meta, badge_url: badgeUrl }
            }).eq('id', data.id).then(({ error }) => {
                if (error) console.error(`Failed to heal stub ${name} in resolveTeamId`, error);
                else console.log(`Healed stub ${name} in resolveTeamId`);
            });
        }
        return data.id;
    }

    // 2. Create Stub
    return await createStub(supabase, tsdbId, name, 'club', badgeUrl);
}

async function resolveLeagueId(supabase: SupabaseClient, tsdbId: string, name: string, badgeUrl?: string): Promise<string | null> {
    if (!tsdbId) return null;

    const { data } = await supabase
        .from('topics')
        .select('id')
        .eq('type', 'league') // or competition
        .eq('metadata->external->>thesportsdb_id', tsdbId)
        .single();

    if (data) return data.id;

    // Create Stub League
    return await createStub(supabase, tsdbId, name, 'league', badgeUrl);
}

// Modified Stub creator to handle types
async function createStub(supabase: SupabaseClient, tsdbId: string, name: string, type: 'club' | 'league' = 'club', badgeUrl?: string): Promise<string | null> {
    console.log(`Creating Stub ${type}: ${name} (${tsdbId})`);

    // Generate slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    // Simple uniqueness check (random suffix if needed, or rely on distinct constraint handling fail)
    // For stubs, collisions are rare-ish on full names, but let's be safe:
    // Actually, smartUpsert handles collisions, but here we are doing raw insert.

    const { data, error } = await supabase
        .from('topics')
        .insert({
            title: name,
            slug: slug, // Potential collision risk here, handled by try-catch usually or logic in `createStub` original
            type: type,
            metadata: {
                external: { thesportsdb_id: tsdbId },
                is_stub: true,
                badge_url: badgeUrl
            }
        })
        .select('id')
        .single();

    if (error) {
        // If slug collision, try appending ID
        if (error.code === '23505') { // Unique violation
            const { data: retry } = await supabase.from('topics').insert({
                title: name,
                slug: `${slug}-${tsdbId}`,
                type: type,
                metadata: {
                    external: { thesportsdb_id: tsdbId },
                    is_stub: true,
                    badge_url: badgeUrl
                }
            }).select('id').single();
            return retry?.id || null;
        }
        console.error('Stub creation failed:', error);
        return null;
    }
    return data?.id;
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

/**
 * Syncs the league table/standings for all Core Leagues.
 * This should be run daily/6-hourly to keep positions up to date.
 */
export async function syncLeagueStandings(
    supabase: SupabaseClient,
    apiClient?: TheSportsDBClient
) {
    if (!apiClient) {
        console.warn('⚠️ No API client provided to syncLeagueStandings');
        return;
    }

    console.log('🏆 Starting League Standings Sync...');
    // Cool-down: Wait 5 seconds to let any previous burst bucket drain
    await new Promise(r => setTimeout(r, 5000));
    const results = {
        leaguesProcessed: 0,
        standingsUpdated: 0,
        errors: 0
    };

    // Core Leagues (National only for now)
    const TARGET_LEAGUES = [
        { id: '4328', name: 'English Premier League' },
        { id: '4335', name: 'Spanish La Liga' },
        { id: '4331', name: 'German Bundesliga' },
        { id: '4332', name: 'Italian Serie A' },
        { id: '4334', name: 'French Ligue 1' }
    ];

    for (const league of TARGET_LEAGUES) {
        try {
            console.log(`\n   Processing ${league.name} (${league.id})...`);

            // 1. Fetch Table
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth(); // 0-indexed
            const season = month >= 6 // July (6) onwards is usually new season for simple logic, but consistency with other calc (Aug/7) is fine. Let's use the same logic as syncDailySchedules.
                ? `${year}-${year + 1}`
                : `${year - 1}-${year}`;

            console.log(`      Fetching standings for season ${season}...`);
            const table = await apiClient.getLeagueTable(league.id, season);

            if (!table || table.length === 0) {
                console.log(`      ⚠️ No table data found for ${league.name}`);
                continue;
            }

            // 2. Resolve internal League ID
            const { data: leagueTopic } = await supabase
                .from('topics')
                .select('id')
                .eq('type', 'league')
                .contains('metadata', { external: { thesportsdb_id: league.id } })
                .single();

            if (!leagueTopic) {
                console.log(`      ❌ League topic not found for ${league.name}`);
                continue;
            }

            // 3. Clear Old Standings
            await supabase.from('league_standings').delete().eq('league_id', leagueTopic.id);

            // 4. Resolve Teams & Prepare Payload
            const teamIds = table.map((r: any) => r.idTeam);

            // Batch fetch club topics
            // We need to cast the JSONB query carefully or fetch all and map in memory if list is small (20 items is tiny)
            // But let's use the 'contains' trick or just fetch by IDs if we had a clean column. 
            // Since `metadata` is JSONB, `in` query on nested field is tricky in Supabase JS without generic match
            // Easiest reliable way for 20 items: Fetch all active clubs and filter, OR map existing club-sync logic.
            // Let's try fetching clubs that HAVE a thesportsdb_id, then map.

            // Optimization: Fetch all clubs with these IDs. 
            // Limitations: Supabase `.in('metadata->external->thesportsdb_id', ...)` doesn't work easily.
            // Workaround: We'll do it one-by-one or fetch all 'club' type topics (lightweight id/metadata select) and map in memory.
            // Fetching 500 clubs 'id/metadata' is fast.

            const { data: teamTopics } = await supabase
                .from('topics')
                .select('id, metadata')
                .eq('type', 'club')
                .not('metadata->external->>thesportsdb_id', 'is', null);

            const teamMap = new Map<string, string>();
            teamTopics?.forEach(t => {
                const extId = t.metadata?.external?.thesportsdb_id;
                if (extId) teamMap.set(String(extId), t.id);
            });

            const standingsPayloads = [];
            for (const row of table) {
                const internalTeamId = teamMap.get(String(row.idTeam));

                if (internalTeamId) {
                    standingsPayloads.push({
                        league_id: leagueTopic.id,
                        team_id: internalTeamId,
                        position: parseInt(row.intRank),
                        points: parseInt(row.intPoints),
                        played: parseInt(row.intPlayed),
                        goals_diff: parseInt(row.intGoalDifference),
                        goals_for: parseInt(row.intGoalsFor),
                        goals_against: parseInt(row.intGoalsAgainst),
                        form: row.strForm,
                        description: row.strDescription
                    });
                }
            }

            if (standingsPayloads.length > 0) {
                const { error } = await supabase.from('league_standings').insert(standingsPayloads);
                if (error) throw error;
                console.log(`      ✅ Updated ${standingsPayloads.length} rows.`);
                results.standingsUpdated += standingsPayloads.length;
            } else {
                console.log(`      ⚠️ No matching club topics found to link.`);
            }

            results.leaguesProcessed++;

        } catch (err: any) {
            console.error(`      ❌ Error syncing ${league.name}:`, err.message);
            results.errors++;
        }
    }

    console.log(`\n🏆 Standings Sync Complete. Processed ${results.leaguesProcessed} leagues. Updated ${results.standingsUpdated} rows.`);
    return results;
}

