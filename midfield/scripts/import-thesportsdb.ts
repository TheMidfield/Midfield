import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@midfield/types/supabase';
import { createHash } from 'crypto';

// Load environment variables
loadEnv();

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// TheSportsDB API
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const RATE_LIMIT_MS = 2000; // 2 seconds between requests

// Configuration
interface ImportConfig {
  dryRun: boolean;
  testMode: boolean;
  leagues?: string[];
}

// Test clubs for phase 1
const TEST_CLUBS = [
  { name: 'Liverpool', league: 'English Premier League' },
  { name: 'Real Madrid', league: 'Spanish La Liga' },
  { name: 'Bayern Munich', league: 'German Bundesliga' }
];

// Full league configuration
const MAJOR_LEAGUES = [
  'English Premier League',
  'Spanish La Liga',
  'Italian Serie A',
  'German Bundesliga',
  'French Ligue 1'
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

// Generate deterministic UUID from TheSportsDB ID
const generateUUID = (type: 'club' | 'player', externalId: string): string => {
  const hash = createHash('md5').update(`${type}:${externalId}`).digest('hex');
  // Format as UUID v4
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  console.log('🚀 TheSportsDB Import Starting...');
  console.log(`   Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Scope: ${config.testMode ? 'TEST (3 clubs)' : 'FULL (5 leagues)'}`);
  console.log('');

  try {
    if (config.testMode) {
      await importTestClubs(config.dryRun);
    } else {
      await importFullLeagues(config.dryRun, config.leagues || MAJOR_LEAGUES);
    }

    // Print final stats
    console.log('\n✨ Import Complete!');
    console.log('═'.repeat(50));
    console.log(`📊 Clubs Processed: ${stats.clubsProcessed}`);
    console.log(`   ├─ Inserted: ${stats.clubsInserted}`);
    console.log(`📊 Players Processed: ${stats.playersProcessed}`);
    console.log(`   ├─ Inserted: ${stats.playersInserted}`);
    console.log(`📊 Relationships Created: ${stats.relationshipsCreated}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Test mode: Import specific clubs
async function importTestClubs(dryRun: boolean) {
  console.log('🧪 TEST MODE: Importing 3 clubs...\n');

  for (const clubConfig of TEST_CLUBS) {
    await importClub(clubConfig.name, clubConfig.league, dryRun);
    await sleep(RATE_LIMIT_MS);
  }
}

// Full mode: Import all clubs from leagues
async function importFullLeagues(dryRun: boolean, leagues: string[]) {
  console.log(`🌍 FULL MODE: Importing ${leagues.length} leagues...\n`);

  for (const leagueName of leagues) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏆 League: ${leagueName}`);
    console.log('='.repeat(60));

    // Fetch all teams in league
    const teamUrl = `${API_BASE}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`;
    
    try {
      const response = await fetch(teamUrl);
      const data = await response.json();
      const teams = data.teams || [];

      console.log(`   Found ${teams.length} teams\n`);

      for (const team of teams) {
        if (team.strSport === 'Soccer') {
          // Use team data directly instead of lookupteam (which is broken)
          await processTeam(team, dryRun);
          stats.clubsProcessed++;
          await sleep(RATE_LIMIT_MS);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error fetching league ${leagueName}:`, error);
      stats.errors++;
    }

    await sleep(RATE_LIMIT_MS);
  }
}

// Import a specific club by name
async function importClub(clubName: string, leagueName: string, dryRun: boolean) {
  console.log(`🔵 Processing: ${clubName}...`);

  try {
    // Search for team
    const searchUrl = `${API_BASE}/searchteams.php?t=${encodeURIComponent(clubName)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    // Find soccer team
    const team = data.teams?.find((t: any) => t.strSport === 'Soccer');

    if (!team) {
      console.error(`   ❌ Soccer team not found: ${clubName}`);
      stats.errors++;
      return;
    }

    await processTeam(team, dryRun);
    stats.clubsProcessed++;

  } catch (error) {
    console.error(`   ❌ Error processing ${clubName}:`, error);
    stats.errors++;
  }
}

// Import a club by ID (used in full mode)
async function importClubById(teamId: string, teamName: string, dryRun: boolean) {
  console.log(`🔵 Processing: ${teamName}...`);

  try {
    // Fetch team details
    const teamUrl = `${API_BASE}/lookupteam.php?id=${teamId}`;
    const response = await fetch(teamUrl);
    const data = await response.json();

    const team = data.teams?.[0];

    if (!team) {
      console.error(`   ❌ Team not found: ${teamName}`);
      stats.errors++;
      return;
    }

    await processTeam(team, dryRun);
    stats.clubsProcessed++;

  } catch (error) {
    console.error(`   ❌ Error processing ${teamName}:`, error);
    stats.errors++;
  }
}

// Process a team and its players
async function processTeam(team: any, dryRun: boolean) {
  const clubId = generateUUID('club', team.idTeam);
  const clubSlug = slugify(team.strTeam);

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
    console.log(`   [DRY RUN] Would insert club: ${team.strTeam}`);
  } else {
    // Upsert club
    const { data: clubData, error: clubError } = await supabase
      .from('topics')
      .upsert(clubTopic, { onConflict: 'id' })
      .select();

    if (clubError) {
      console.error(`   ❌ Error inserting ${team.strTeam} (ID: ${team.idTeam}, Slug: ${clubSlug}):`, clubError);
      stats.errors++;
      return;
    }

    console.log(`   ✅ Inserted/Updated club: ${team.strTeam} (Slug: ${clubSlug})`);
    stats.clubsInserted++;
  }

  // Fetch players
  await sleep(RATE_LIMIT_MS);
  const playersUrl = `${API_BASE}/lookup_all_players.php?id=${team.idTeam}`;
  
  try {
    const playersResponse = await fetch(playersUrl);
    const playersData = await playersResponse.json();
    const players = playersData.player || [];

    console.log(`   Players found: ${players.length}`);

    let playerCount = 0;
    const playerIds: string[] = [];

    for (const player of players) {
      if (!player.strPlayer) continue;

      const playerId = generateUUID('player', player.idPlayer);
      const playerSlug = slugify(player.strPlayer);

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

      if (dryRun) {
        console.log(`      [DRY RUN] Would insert player: ${player.strPlayer}`);
      } else {
        // Upsert player
        const { error: playerError } = await supabase
          .from('topics')
          .upsert(playerTopic, { onConflict: 'id' });

        if (playerError) {
          console.error(`      ❌ Error inserting player ${player.strPlayer}:`, playerError);
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
    } else if (dryRun && playerIds.length > 0) {
      console.log(`   [DRY RUN] Would create ${playerIds.length} relationships`);
    }

  } catch (error) {
    console.error(`   ❌ Error fetching players:`, error);
    stats.errors++;
  }
}

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
    testMode: args.includes('--test'),
    leagues: undefined
  };

  // Parse leagues argument
  const leaguesIndex = args.findIndex(arg => arg.startsWith('--leagues='));
  if (leaguesIndex !== -1) {
    const leaguesArg = args[leaguesIndex].split('=')[1];
    config.leagues = leaguesArg.split(',').map(l => l.trim());
  }

  return config;
}

// Run the import
const config = parseArgs();
importTheSportsDB(config);
