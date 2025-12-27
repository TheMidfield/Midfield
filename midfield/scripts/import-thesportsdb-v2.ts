import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@midfield/types/supabase';
import { createHash } from 'crypto';

// Load environment variables
loadEnv();

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const apiKey = process.env.THESPORTSDB_API_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

if (!apiKey) {
    console.error('❌ Missing THESPORTSDB_API_KEY in .env');
    process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// TheSportsDB v2 API
const API_BASE = 'https://www.thesportsdb.com/api/v2/json';
const RATE_LIMIT_MS = 1000; // 1 second between requests (100/min limit)

// Configuration
interface ImportConfig {
    dryRun: boolean;
    testMode: boolean;
    leagues?: string[];
}

// Target leagues with their TheSportsDB IDs
const MAJOR_LEAGUES = [
    { id: '4328', name: 'English Premier League' },
    { id: '4335', name: 'Spanish La Liga' },
    { id: '4332', name: 'Italian Serie A' },
    { id: '4331', name: 'German Bundesliga' },
    { id: '4334', name: 'French Ligue 1' }
];

// Utilities
const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// Generate collision-safe slug (appends ID if slug exists)
const generateSafeSlug = async (name: string, thesportsdbId: string, type: 'club' | 'player' | 'league'): Promise<string> => {
    const baseSlug = slugify(name);

    // Check if slug already exists
    const { data: existing } = await supabase
        .from('topics')
        .select('id')
        .eq('slug', baseSlug)
        .eq('type', type)
        .maybeSingle();

    // If slug exists, append TheSportsDB ID for uniqueness
    if (existing) {
        return `${baseSlug}-${thesportsdbId}`;
    }

    return baseSlug;
};

// Generate deterministic UUID from TheSportsDB ID (SAME AS V1)
const generateUUID = (type: 'club' | 'player' | 'league', externalId: string): string => {
    const hash = createHash('md5').update(`${type}:${externalId}`).digest('hex');
    // Format as UUID v4
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// v2 API Fetch with header authentication
async function fetchV2<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-API-KEY': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ Error fetching ${endpoint}:`, error);
        throw error;
    }
}

// Statistics tracker
const stats = {
    clubsProcessed: 0,
    clubsInserted: 0,
    playersProcessed: 0,
    playersInserted: 0,
    relationshipsCreated: 0,
    errors: 0
};

// Main import function
async function importTheSportsDB(config: ImportConfig) {
    console.log('🚀 TheSportsDB v2 Import Starting...');
    console.log(`   Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`   API: v2 (Premium - NO player limits!)`);
    console.log(`   Scope: ${MAJOR_LEAGUES.length} leagues`);
    console.log('');

    try {
        for (const league of MAJOR_LEAGUES) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🏆 League: ${league.name} (ID: ${league.id})`);
            console.log('='.repeat(60));

            await importLeague(league.id, league.name, config.dryRun);
            await sleep(RATE_LIMIT_MS);
        }

        // Print final stats
        console.log('\n✨ Import Complete!');
        console.log('═'.repeat(50));
        console.log(`📊 Clubs Processed: ${stats.clubsProcessed}`);
        console.log(`   ├─ Inserted/Updated: ${stats.clubsInserted}`);
        console.log(`📊 Players Processed: ${stats.playersProcessed}`);
        console.log(`   ├─ Inserted/Updated: ${stats.playersInserted}`);
        console.log(`📊 Relationships Created: ${stats.relationshipsCreated}`);
        console.log(`❌ Errors: ${stats.errors}`);
        console.log('═'.repeat(50));

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Import a league and all its teams
async function importLeague(leagueId: string, leagueName: string, dryRun: boolean) {
    try {
        // 1. Fetch full league details from V1 API for images
        const leagueDetailsUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/lookupleague.php?id=${leagueId}`;
        const leagueDetailsRes = await fetch(leagueDetailsUrl);
        const leagueDetailsData = await leagueDetailsRes.json();
        const leagueDetails = leagueDetailsData.leagues?.[0];

        // 2. Upsert League Topic
        const leagueUuid = generateUUID('league', leagueId);
        const leagueSlug = await generateSafeSlug(leagueName, leagueId, 'league');

        const leagueTopic = {
            id: leagueUuid,
            slug: leagueSlug,
            type: 'league' as const,
            title: leagueName,
            description: leagueDetails?.strDescriptionEN?.substring(0, 500) || `Official page for ${leagueName}.`,
            metadata: {
                external: {
                    thesportsdb_id: leagueId,
                    source: 'thesportsdb'
                },
                logo_url: leagueDetails?.strLogo,
                trophy_url: leagueDetails?.strTrophy,
                badge_url: leagueDetails?.strBadge,
                country: leagueDetails?.strCountry
            },
            is_active: true
        };

        if (!dryRun) {
            await supabase.from('topics').upsert(leagueTopic, { onConflict: 'id' });
            console.log(`   ✅ Upserted League: ${leagueName}`);
        }

        // v2 endpoint: /list/teams/{leagueId}
        const data = await fetchV2<{ list: any[] }>(`/list/teams/${leagueId}`);
        const teams = data.list || [];

        console.log(`   Found ${teams.length} teams\n`);

        // Pass 1: Upsert all clubs first (to satisfy FKs for fixtures)
        console.log(`   Phase 1: Upserting ${teams.length} clubs...`);
        for (const team of teams) {
            await upsertClubOnly(team, dryRun);
            stats.clubsProcessed++;
            // await sleep(100); // Tiny delay
        }

        // Pass 2: Process players and fixtures
        console.log(`\n   Phase 2: Fetching details (Players & Fixtures)...`);
        for (const team of teams) {
            await processTeamDetails(team, dryRun);
            await sleep(RATE_LIMIT_MS);
        }
    } catch (error) {
        console.error(`   ❌ Error fetching league ${leagueName}:`, error);
        stats.errors++;
    }
}

// Phase 1: Upsert Club Topic Only
async function upsertClubOnly(team: any, dryRun: boolean) {
    const clubId = generateUUID('club', team.idTeam);
    const clubSlug = await generateSafeSlug(team.strTeam, team.idTeam, 'club');

    // console.log(`🔵 Upserting Club: ${team.strTeam}...`);

    // Prepare club topic
    const clubTopic = {
        id: clubId,
        slug: clubSlug,
        type: 'club' as const,
        title: team.strTeam,
        description: team.strDescriptionEN?.substring(0, 500) || `The official profile of ${team.strTeam}.`,
        metadata: {
            external: {
                thesportsdb_id: team.idTeam,
                source: 'thesportsdb'
            },
            badge_url: team.strBadge || team.strTeamBadge,
            stadium: team.strStadium,
            founded: team.intFormedYear ? parseInt(team.intFormedYear) : null,
            league: team.strLeague,
            capacity: team.intStadiumCapacity ? parseInt(team.intStadiumCapacity) : null,
            socials: {
                website: team.strWebsite,
                twitter: team.strTwitter,
                instagram: team.strInstagram,
                facebook: team.strFacebook
            }
        },
        is_active: true,
        follower_count: 0,
        post_count: 0
    };

    if (dryRun) {
        // console.log(`   [DRY RUN] Would upsert club: ${team.strTeam}`);
    } else {
        const { error: clubError } = await supabase
            .from('topics')
            .upsert(clubTopic, { onConflict: 'id' });

        if (clubError) {
            console.error(`   ❌ Error upserting ${team.strTeam}:`, clubError);
            stats.errors++;
            return;
        }
        stats.clubsInserted++;
    }
}

// Phase 2: Process Details (Players, Fixtures)
async function processTeamDetails(team: any, dryRun: boolean) {
    const clubId = generateUUID('club', team.idTeam);
    console.log(`🔵 Details for: ${team.strTeam}`);

    // Fetch players using v2 endpoint (NO 10-PLAYER LIMIT!)
    try {
        // v2 endpoint: /list/players/{teamId}
        const playersData = await fetchV2<{ list: any[] }>(`/list/players/${team.idTeam}`);
        const players = playersData.list || [];

        // console.log(`   Players found: ${players.length} (v2 API - UNLIMITED!)`);

        let playerCount = 0;
        const playerIds: string[] = [];

        for (const player of players) {
            if (!player.strPlayer) continue;

            const playerId = generateUUID('player', player.idPlayer);
            const playerSlug = await generateSafeSlug(player.strPlayer, player.idPlayer, 'player');

            playerIds.push(playerId);

            // Prepare player topic
            const playerTopic = {
                id: playerId,
                slug: playerSlug,
                type: 'player' as const,
                title: player.strPlayer,
                description: player.strDescriptionEN?.substring(0, 300) || `Player for ${team.strTeam}.`,
                metadata: {
                    external: {
                        thesportsdb_id: player.idPlayer,
                        source: 'thesportsdb'
                    },
                    photo_url: player.strCutout || player.strThumb,
                    render_url: player.strRender,
                    position: player.strPosition,
                    nationality: player.strNationality,
                    birth_date: player.dateBorn,
                    height: player.strHeight,
                    weight: player.strWeight,
                    jersey_number: player.strNumber ? parseInt(player.strNumber) : null
                },
                is_active: true,
                follower_count: 0,
                post_count: 0
            };

            if (!dryRun) {
                // Upsert player
                const { error: playerError } = await supabase
                    .from('topics')
                    .upsert(playerTopic, { onConflict: 'id' });

                if (playerError) {
                    console.error(`      ❌ Error upserting player ${player.strPlayer}:`, playerError);
                    stats.errors++;
                    continue;
                }
                stats.playersInserted++;
            }

            playerCount++;
            stats.playersProcessed++;
        }

        console.log(`   ✅ Processed ${playerCount} players`);

        // Create relationships (club -> players)
        if (!dryRun && playerIds.length > 0) {
            await createRelationships(clubId, playerIds);
        }

        // Fetch fixtures (New)
        if (!dryRun) {
            await processTeamFixtures(clubId, team.idTeam, team.strTeam, team.idLeague);
        }

    } catch (error) {
        console.error(`   ❌ Error fetching details for ${team.strTeam}:`, error);
        stats.errors++;
    }
}

// Create topic relationships (club -> players)
// Create topic relationships (club -> players)
async function createRelationships(clubId: string, playerIds: string[]) {
    const relationships = playerIds.map(playerId => ({
        parent_topic_id: clubId,
        child_topic_id: playerId,
        relationship_type: 'plays_for' as const,
        metadata: {},
        valid_from: new Date().toISOString(),
        valid_until: null
    }));

    const { error } = await supabase
        .from('topic_relationships')
        .upsert(relationships, {
            onConflict: 'parent_topic_id,child_topic_id,relationship_type'
        });

    if (error) {
        console.error(`   ❌ Error creating relationships:`, error);
        stats.errors++;
    } else {
        console.log(`   ✅ Created ${playerIds.length} relationships`);
        stats.relationshipsCreated += playerIds.length;
    }
}

// Parse CLI arguments
function parseArgs(): ImportConfig {
    const args = process.argv.slice(2);

    const config: ImportConfig = {
        dryRun: args.includes('--dry-run'),
        testMode: false, // v2 always does full import
        leagues: undefined
    };

    return config;
}

// Run the import
const config = parseArgs();
importTheSportsDB(config);

// Process fixtures for a team
async function processTeamFixtures(clubUuid: string, tsdbTeamId: string, teamName: string, tsdbLeagueId: string) {
    try {
        // 1. Fetch Next Matches
        const nextData = await fetchV2<{ schedule: any[] }>(`/schedule/next/team/${tsdbTeamId}`);
        const prevData = await fetchV2<{ results: any[] }>(`/schedule/previous/team/${tsdbTeamId}`); // Note: endpoint might be 'results' or 'schedule'

        // Combine results. V2 endpoints:
        // /schedule/next/team/{id} -> { schedule: [...] }
        // /schedule/previous/team/{id} -> { results: [...] } (Usually called results)

        const fixtures = [
            ...(nextData?.schedule || []),
            ...(prevData?.results || [])
        ];

        if (fixtures.length === 0) return;

        console.log(`      📅 Processing ${fixtures.length} fixtures for ${teamName}...`);

        let count = 0;
        for (const f of fixtures) {
            // Basic validation
            if (!f.strHomeTeam || !f.strAwayTeam || !f.dateEvent) continue;

            // Generate ID from TSDB ID (since DB uses bigint, we use the external ID directly)
            const fixtureId = parseInt(f.idEvent);

            // Resolve Team UUIDs
            const homeTeamUuid = generateUUID('club', f.idHomeTeam);
            const awayTeamUuid = generateUUID('club', f.idAwayTeam);

            const competitionUuid = generateUUID('league', f.idLeague);

            // STUB CREATION: Ensure topics exist before upserting fixture
            await Promise.all([
                ensureStubTopic(homeTeamUuid, f.strHomeTeam, 'club', f.idHomeTeam),
                ensureStubTopic(awayTeamUuid, f.strAwayTeam, 'club', f.idAwayTeam),
                ensureStubTopic(competitionUuid, f.strLeague, 'league', f.idLeague)
            ]);

            const fixtureRecord = {
                id: fixtureId,
                home_team_id: homeTeamUuid,
                away_team_id: awayTeamUuid,
                competition_id: competitionUuid,
                date: f.dateEvent + (f.strTime ? `T${f.strTime}` : ''),
                status: f.intHomeScore ? 'completed' : 'scheduled',
                home_score: f.intHomeScore ? parseInt(f.intHomeScore) : null,
                away_score: f.intAwayScore ? parseInt(f.intAwayScore) : null,
                venue: f.strVenue,
                gameweek: f.intRound ? parseInt(f.intRound) : null
                // metadata: REMOVED as column does not exist
            };

            const { error } = await supabase.from('fixtures').upsert(fixtureRecord, { onConflict: 'id' });
            if (!error) {
                count++;
            } else {
                console.error(`      ❌ Error upserting fixture ${f.strEvent}:`, error);
            }
        }
        // console.log(`      ✅ Saved ${count} fixtures`);

    } catch (e) {
        console.error(`      ⚠️ Error fetching fixtures for ${teamName}:`, e);
    }
}

// Ensure a topic exists (create a "Stub" if not)
async function ensureStubTopic(id: string, title: string, type: 'club' | 'league', externalId: string) {
    if (!title || !id) return;

    // Force explicit check-then-insert to debug silent failure and ensure existence
    const { data: existing } = await supabase.from('topics').select('id').eq('id', id).maybeSingle();
    if (existing) return;

    const slug = await generateSafeSlug(title, externalId, type);

    // Minimal Stub Topic
    const stub = {
        id,
        slug,
        type,
        title,
        description: `Stub for ${title}`,
        metadata: {
            external: {
                thesportsdb_id: externalId,
                source: 'thesportsdb',
                is_stub: true
            },
            badge_url: null // UI will show placeholder
        },
        is_active: true
    };

    // Insert stub
    const { error } = await supabase.from('topics').insert(stub);

    if (error) {
        // Ignore 23505 (unique_violation) which means race condition won
        if (error.code !== '23505') {
            console.error(`Stub error for ${title}:`, error);
        }
    } else {
        // console.log(`      ✨ Created Stub: ${title}`);
    }
}
