import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@midfield/types/supabase';
import { createHash } from 'crypto';

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const RATE_LIMIT_MS = 2000;

// Test with clubs that might be confused (alphabetically close)
const VALIDATION_CLUBS = [
  { name: 'Arsenal', expectedId: '133604' },
  { name: 'Aston Villa', expectedId: '133601' }
];

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

const generateUUID = (type: 'club' | 'player', externalId: string): string => {
  const hash = createHash('md5').update(`${type}:${externalId}`).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function validate() {
  console.log('🔍 Validation Test Starting...');
  console.log('═'.repeat(60));
  console.log('Testing: Arsenal vs Aston Villa (potential confusion)\n');

  for (const clubConfig of VALIDATION_CLUBS) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🔵 Processing: ${clubConfig.name}`);
    console.log('─'.repeat(60));

    try {
      // Fetch team by search
      const searchUrl = `${API_BASE}/searchteams.php?t=${encodeURIComponent(clubConfig.name)}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      const team = searchData.teams?.find((t: any) => t.strSport === 'Soccer');

      if (!team) {
        console.error(`❌ Team not found: ${clubConfig.name}`);
        continue;
      }

      console.log(`\n📋 Club Details:`);
      console.log(`   Name (API): ${team.strTeam}`);
      console.log(`   ID (API): ${team.idTeam}`);
      console.log(`   Expected ID: ${clubConfig.expectedId}`);
      console.log(`   ✅ ID Match: ${team.idTeam === clubConfig.expectedId ? 'YES' : '❌ NO!!!'}`);

      const clubId = generateUUID('club', team.idTeam);
      const clubSlug = slugify(team.strTeam);

      console.log(`   Generated UUID: ${clubId}`);
      console.log(`   Generated Slug: ${clubSlug}`);

      // Fetch players
      await sleep(RATE_LIMIT_MS);
      const playersUrl = `${API_BASE}/lookup_all_players.php?id=${team.idTeam}`;
      const playersResponse = await fetch(playersUrl);
      const playersData = await playersResponse.json();
      const players = playersData.player || [];

      console.log(`\n👥 Players (${players.length} found):`);

      // Check each player's team association
      let correctAssociations = 0;
      let incorrectAssociations = 0;

      for (const player of players.slice(0, 5)) { // Show first 5
        const playerClubName = player.strTeam;
        const playerClubId = player.idTeam;
        const isCorrect = playerClubId === team.idTeam && playerClubName === team.strTeam;

        if (isCorrect) {
          correctAssociations++;
          console.log(`   ✅ ${player.strPlayer} → ${playerClubName} (${playerClubId})`);
        } else {
          incorrectAssociations++;
          console.log(`   ❌ ${player.strPlayer} → ${playerClubName} (${playerClubId}) [MISMATCH!]`);
        }
      }

      if (players.length > 5) {
        console.log(`   ... and ${players.length - 5} more players`);
      }

      console.log(`\n📊 Association Check:`);
      console.log(`   Correct: ${correctAssociations}/${Math.min(5, players.length)}`);
      console.log(`   Incorrect: ${incorrectAssociations}/${Math.min(5, players.length)}`);

      if (incorrectAssociations > 0) {
        console.log(`   ⚠️  WARNING: Found mismatched associations!`);
      }

      // Now test database insertion
      console.log(`\n💾 Testing Database Operations:`);

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
          league: team.strLeague
        },
        is_active: true,
        follower_count: 0,
        post_count: 0
      };

      const { error: clubError } = await supabase
        .from('topics')
        .upsert(clubTopic, { onConflict: 'id' });

      if (clubError) {
        console.log(`   ❌ Club insertion failed:`, clubError.message);
        continue;
      }

      console.log(`   ✅ Club inserted: ${team.strTeam}`);

      // Insert first player as test
      const testPlayer = players[0];
      if (testPlayer) {
        const playerId = generateUUID('player', testPlayer.idPlayer);
        const playerSlug = slugify(testPlayer.strPlayer);

        const playerTopic = {
          id: playerId,
          slug: playerSlug,
          type: 'player' as const,
          title: testPlayer.strPlayer,
          description: `Player for ${team.strTeam}.`,
          metadata: {
            external: {
              thesportsdb_id: testPlayer.idPlayer,
              source: 'thesportsdb'
            },
            photo_url: testPlayer.strCutout || testPlayer.strThumb,
            position: testPlayer.strPosition,
            nationality: testPlayer.strNationality
          },
          is_active: true,
          follower_count: 0,
          post_count: 0
        };

        const { error: playerError } = await supabase
          .from('topics')
          .upsert(playerTopic, { onConflict: 'id' });

        if (playerError) {
          console.log(`   ❌ Player insertion failed:`, playerError.message);
        } else {
          console.log(`   ✅ Player inserted: ${testPlayer.strPlayer}`);

          // Create relationship
          const relationship = {
            parent_topic_id: clubId,
            child_topic_id: playerId,
            relationship_type: 'plays_for' as const,
            metadata: {},
            valid_from: new Date().toISOString(),
            valid_until: null
          };

          const { error: relError } = await supabase
            .from('topic_relationships')
            .upsert(relationship, { onConflict: 'parent_topic_id,child_topic_id,relationship_type' });

          if (relError) {
            console.log(`   ❌ Relationship creation failed:`, relError.message);
          } else {
            console.log(`   ✅ Relationship created: ${team.strTeam} → ${testPlayer.strPlayer}`);
          }
        }
      }

      await sleep(RATE_LIMIT_MS);

    } catch (error) {
      console.error(`❌ Error processing ${clubConfig.name}:`, error);
    }
  }

  // Verify in database
  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('🔍 DATABASE VERIFICATION');
  console.log('═'.repeat(60));

  const { data: clubs } = await supabase
    .from('topics')
    .select('id, title, slug, metadata')
    .eq('type', 'club')
    .eq('is_active', true)
    .order('title');

  if (clubs) {
    console.log(`\n📊 Clubs in Database: ${clubs.length}`);
    for (const club of clubs) {
      const externalId = (club.metadata as any)?.external?.thesportsdb_id;
      console.log(`   ${club.title} (${club.slug})`);
      console.log(`      DB ID: ${club.id}`);
      console.log(`      External ID: ${externalId}`);

      // Check players
      const { data: relationships } = await supabase
        .from('topic_relationships')
        .select('child_topic_id, topics!topic_relationships_child_topic_id_fkey(title)')
        .eq('parent_topic_id', club.id)
        .eq('relationship_type', 'plays_for');

      if (relationships && relationships.length > 0) {
        console.log(`      Players (${relationships.length}):`);
        for (const rel of relationships) {
          const playerData = (rel as any).topics;
          console.log(`         - ${playerData?.title || 'Unknown'}`);
        }
      }
      console.log('');
    }
  }

  console.log('═'.repeat(60));
  console.log('✅ Validation Complete!\n');
}

validate();
