import { createClient } from '@supabase/supabase-js';
import pLimit from 'p-limit';
import { config } from 'dotenv';

config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API_KEY = process.env.THESPORTSDB_API_KEY || '3';
const CONCURRENCY = 20;
const limit = pLimit(CONCURRENCY);

let stats = {
    clubsProcessed: 0,
    clubsUpdated: 0,
    playersProcessed: 0,
    playersUpdated: 0,
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

        // 2. Update each player
        for (const p of players) {
            if (!p.strPlayer || !p.idPlayer) continue;

            stats.playersProcessed++;

            // Find player in our database
            const { data: existing } = await supabase
                .from('topics')
                .select('id')
                .eq('type', 'player')
                .filter('metadata->external->>thesportsdb_id', 'eq', p.idPlayer)
                .maybeSingle();

            if (!existing) continue;

            // Update with full metadata
            const { error } = await supabase
                .from('topics')
                .update({
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
                })
                .eq('id', existing.id);

            if (!error) stats.playersUpdated++;
        }

        // 3. Update club metadata
        const clubRes = await fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupteam.php?id=${thesportsdbId}`);
        const clubData = await clubRes.json();
        const t = clubData.teams?.[0];

        if (t) {
            const { error } = await supabase
                .from('topics')
                .update({
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
                })
                .eq('id', club.id);

            if (!error) stats.clubsUpdated++;
        }

        stats.clubsProcessed++;
    } catch (err: any) {
        stats.errors++;
        console.error(`   ❌ Error processing ${club.title}: ${err.message}`);
    }
}

async function main() {
    console.log('\n🚀 FINAL GENESIS - TEAM-BASED PLAYER SYNC');
    console.log('═'.repeat(70));
    console.log(`⚡ Concurrency: ${CONCURRENCY}`);
    console.log(`📡 Using V1 API: lookup_all_players.php (PROVEN)`);
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
    console.log('🎉 GENESIS COMPLETE!');
    console.log('═'.repeat(70));
    console.log(`⏱️  Total Time: ${time}s`);
    console.log(`🏢 Clubs Updated: ${stats.clubsUpdated}/${stats.clubsProcessed}`);
    console.log(`👤 Players Processed: ${stats.playersProcessed}`);
    console.log(`👤 Players Updated: ${stats.playersUpdated}`);
    console.log(`⚡ Average Rate: ${avgRate} players/second`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('═'.repeat(70));
}

main().catch(console.error);
