
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
    const CHUNK_SIZE = 10;
    for (let i = 0; i < coreClubs.length; i += CHUNK_SIZE) {
        const chunk = coreClubs.slice(i, i + CHUNK_SIZE);
        console.log(`Processing Batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(coreClubs.length / CHUNK_SIZE)}...`);

        await Promise.all(chunk.map(async (club) => {
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
                    const homeId = await resolveTeamId(supabase, event.idHomeTeam, event.strHomeTeam);
                    const awayId = await resolveTeamId(supabase, event.idAwayTeam, event.strAwayTeam);
                    const competitionId = await resolveLeagueId(supabase, event.idLeague, event.strLeague);

                    if (!homeId || !awayId || !competitionId) continue;

                    const status = normalizeStatus(event.strStatus);

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
        }));
    }
}

// Reuse or duplicate helper to resolve/stub
async function resolveTeamId(supabase: SupabaseClient, tsdbId: string, name: string): Promise<string | null> {
    if (!tsdbId) return null;

    // 1. Try to find by metadata->external->thesportsdb_id
    const { data } = await supabase
        .from('topics')
        .select('id')
        .eq('metadata->external->>thesportsdb_id', tsdbId)
        .single();

    if (data) return data.id;

    // 2. Create Stub
    return await createStub(supabase, tsdbId, name, 'club');
}

async function resolveLeagueId(supabase: SupabaseClient, tsdbId: string, name: string): Promise<string | null> {
    if (!tsdbId) return null;

    const { data } = await supabase
        .from('topics')
        .select('id')
        .eq('type', 'league') // or competition
        .eq('metadata->external->>thesportsdb_id', tsdbId)
        .single();

    if (data) return data.id;

    // Create Stub League
    return await createStub(supabase, tsdbId, name, 'league');
}

// Modified Stub creator to handle types
async function createStub(supabase: SupabaseClient, tsdbId: string, name: string, type: 'club' | 'league' = 'club'): Promise<string | null> {
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
                is_stub: true
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
                metadata: { external: { thesportsdb_id: tsdbId }, is_stub: true }
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
            const season = '2024-2025';
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

