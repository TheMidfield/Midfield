import { createClient } from '@supabase/supabase-js';
import pLimit from 'p-limit';
import { config } from 'dotenv';
import { smartUpsertTopic } from '../packages/logic/src/sync/smart-upsert';
import type { Database } from '../packages/types/src/supabase';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Database verification - Extract project ID from URL
const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const isProduction = projectId === 'oerbyhaqhuixpjrubshm';
const isDevelopment = projectId === 'bocldhavewgfxmbuycxy';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const API_KEY = process.env.THESPORTSDB_API_KEY || '3';
const CONCURRENCY = 20;
const limit = pLimit(CONCURRENCY);

let stats = {
    clubsProcessed: 0,
    clubsUpdated: 0,
    playersProcessed: 0,
    playersUpdated: 0,
    playersSkipped: 0,
    errors: 0
};

async function processClub(club: any) {
    const thesportsdbId = club.metadata?.external?.thesportsdb_id;
    if (!thesportsdbId) return;

    try {
        // 1. Fetch ALL players for this club using the PROVEN endpoint
        const playersRes = await fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookup_all_players.php?id=${thesportsdbId}`);
        const playersData = await playersRes.json();
        const players = playersData.player || [];

        // 2. Update each player using smartUpsertTopic
        for (const p of players) {
            if (!p.strPlayer || !p.idPlayer) continue;

            stats.playersProcessed++;

            try {
                // Check if player exists first (this is a metadata UPDATE sync, not a creation sync)
                const { data: existing } = await supabase
                    .from('topics')
                    .select('id')
                    .eq('type', 'player')
                    .filter('metadata->external->>thesportsdb_id', 'eq', p.idPlayer)
                    .maybeSingle();

                if (!existing) {
                    // Player doesn't exist yet - skip (they'll be created by schedule sync)
                    stats.playersSkipped++;
                    continue;
                }

                // Prepare metadata object - smartUpsertTopic will merge with existing
                const playerData = {
                    title: p.strPlayer,
                    type: 'player' as const,
                    description: p.strDescriptionEN?.substring(0, 300) || `Player for ${club.title}.`,
                    metadata: {
                        external: {
                            thesportsdb_id: p.idPlayer,
                            source: 'thesportsdb'
                        },
                        photo_url: p.strCutout || p.strThumb,
                        render_url: p.strRender,
                        position: p.strPosition,
                        nationality: p.strNationality,
                        birth_date: p.dateBorn,
                        height: p.strHeight,
                        weight: p.strWeight,
                        jersey_number: p.strNumber ? parseInt(p.strNumber) : null
                    }
                };

                const { data, error } = await smartUpsertTopic(
                    supabase,
                    playerData,
                    'player',
                    p.idPlayer
                );

                if (error) {
                    console.error(`   ⚠️  Failed to update player ${p.strPlayer}: ${error.message}`);
                    stats.errors++;
                } else if (data) {
                    stats.playersUpdated++;
                }
            } catch (err: any) {
                console.error(`   ⚠️  Exception updating player ${p.strPlayer}: ${err.message}`);
                stats.errors++;
            }
        }

        // 3. Update club metadata using smartUpsertTopic
        const clubRes = await fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupteam.php?id=${thesportsdbId}`);
        const clubData = await clubRes.json();
        const t = clubData.teams?.[0];

        if (t) {
            const clubUpdateData = {
                title: t.strTeam || club.title,
                type: 'club' as const,
                description: t.strDescriptionEN?.substring(0, 500) || club.description,
                metadata: {
                    external: {
                        thesportsdb_id: t.idTeam,
                        source: 'thesportsdb'
                    },
                    badge_url: t.strBadge || t.strTeamBadge,
                    stadium: t.strStadium,
                    founded: t.intFormedYear ? parseInt(String(t.intFormedYear)) : null,
                    league: t.strLeague,
                    capacity: t.intStadiumCapacity ? parseInt(String(t.intStadiumCapacity)) : null,
                    socials: {
                        website: t.strWebsite,
                        twitter: t.strTwitter,
                        instagram: t.strInstagram,
                        facebook: t.strFacebook
                    }
                }
            };

            const { data, error } = await smartUpsertTopic(
                supabase,
                clubUpdateData,
                'club',
                t.idTeam
            );

            if (!error && data) {
                stats.clubsUpdated++;
            } else if (error) {
                console.error(`   ⚠️  Failed to update club ${club.title}: ${error.message}`);
            }
        }

        stats.clubsProcessed++;
    } catch (err: any) {
        stats.errors++;
        console.error(`   ❌ Error processing ${club.title}: ${err.message}`);
    }
}

async function main() {
    console.log('\n🚀 STATIC METADATA SYNC - WEEKLY UPDATE');
    console.log('═'.repeat(70));
    
    // 🔍 DATABASE VERIFICATION (Critical for Prod/Dev separation)
    console.log('🔍 DATABASE CONNECTION:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Project ID: ${projectId}`);
    if (isProduction) {
        console.log('   ✅ Environment: PRODUCTION (oerbyhaqhuixpjrubshm)');
    } else if (isDevelopment) {
        console.log('   ⚠️  Environment: DEVELOPMENT (bocldhavewgfxmbuycxy)');
    } else {
        console.log('   ❌ Environment: UNKNOWN - Check your environment variables!');
        console.log('   Expected PROD: oerbyhaqhuixpjrubshm');
        console.log('   Expected DEV: bocldhavewgfxmbuycxy');
    }
    console.log('═'.repeat(70));
    
    console.log(`⚡ Concurrency: ${CONCURRENCY}`);
    console.log(`📡 Using V1 API: lookup_all_players.php (PROVEN)`);
    console.log(`🔧 Using smartUpsertTopic: Metadata merging enabled`);
    console.log('═'.repeat(70));
    console.log('');

    const start = Date.now();

    // Fetch ALL clubs
    console.log('📊 Fetching all clubs...');
    const { data: clubs } = await supabase
        .from('topics')
        .select('id, title, description, metadata')
        .eq('type', 'club')
        .not('metadata->external->>thesportsdb_id', 'is', null);

    if (!clubs) {
        console.error('❌ Failed to fetch clubs');
        return;
    }

    console.log(`✅ Found ${clubs.length} clubs\n`);
    console.log('🔄 Processing clubs and their players...\n');

    // Progress tracking
    const interval = setInterval(() => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const clubProgress = ((stats.clubsProcessed / clubs.length) * 100).toFixed(1);
        const rate = (stats.playersUpdated / (Date.now() - start) * 1000).toFixed(1);

        console.log(`⏱️  ${elapsed}s | Clubs: ${stats.clubsProcessed}/${clubs.length} (${clubProgress}%) | Players: ${stats.playersUpdated} | ${rate}/s | Errors: ${stats.errors}`);
    }, 3000);

    // Process all clubs concurrently
    await Promise.all(clubs.map(club => limit(() => processClub(club))));

    clearInterval(interval);

    const time = ((Date.now() - start) / 1000).toFixed(2);
    const avgRate = (stats.playersUpdated / (Date.now() - start) * 1000).toFixed(1);

    console.log('\n' + '═'.repeat(70));
    console.log('🎉 SYNC COMPLETE!');
    console.log('═'.repeat(70));
    console.log(`⏱️  Total Time: ${time}s`);
    console.log(`🏢 Clubs Updated: ${stats.clubsUpdated}/${stats.clubsProcessed}`);
    console.log(`👤 Players Processed: ${stats.playersProcessed}`);
    console.log(`👤 Players Updated: ${stats.playersUpdated}`);
    console.log(`⏭️  Players Skipped: ${stats.playersSkipped}`);
    console.log(`⚡ Average Rate: ${avgRate} players/second`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('═'.repeat(70));
    
    // Final verification reminder
    if (isProduction) {
        console.log('\n✅ Updates applied to PRODUCTION database');
    } else if (isDevelopment) {
        console.log('\n⚠️  Updates applied to DEVELOPMENT database');
    }
    console.log('');
}

main().catch(console.error);
