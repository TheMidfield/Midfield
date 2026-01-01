import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Top 5 leagues we care about
const TOP_5_LEAGUES = [
    'Premier League',
    'La Liga',
    'Serie A',
    'Ligue 1',
    'Bundesliga'
];

async function comprehensiveImageAudit() {
    console.log('🔍 COMPREHENSIVE IMAGE AUDIT - TOP 5 LEAGUES FOCUS\n');
    console.log('='.repeat(70));

    // Get league topic IDs
    const { data: leagues } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'league')
        .in('title', TOP_5_LEAGUES);

    console.log(`\n📊 Found ${leagues?.length || 0} leagues in our top 5\n`);

    // Analysis for each league
    for (const league of leagues || []) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🏆 ${league.title}`);
        console.log('='.repeat(70));

        // Get clubs in this league (via league standings or metadata)
        const { data: clubs } = await supabase
            .from('topics')
            .select('id, title, slug, metadata')
            .eq('type', 'club')
            .filter('metadata->>league', 'eq', league.title)
            .order('title');

        console.log(`\n📍 CLUBS (${clubs?.length || 0} total):`);
        let clubsWithBadges = 0;
        let clubsWithoutBadges = 0;

        clubs?.forEach((club: any) => {
            const hasBadge = !!club.metadata?.badge_url;
            if (hasBadge) clubsWithBadges++;
            else clubsWithoutBadges++;

            console.log(`  ${hasBadge ? '✅' : '❌'} ${club.title}`);
            if (!hasBadge) {
                console.log(`     Metadata keys: ${Object.keys(club.metadata || {}).join(', ')}`);
                console.log(`     TheSportsDB ID: ${club.metadata?.external?.thesportsdb_id || 'MISSING'}`);
            }
        });

        console.log(`\n  📈 Badge Coverage: ${clubsWithBadges}/${clubs?.length || 0} (${Math.round((clubsWithBadges / (clubs?.length || 1)) * 100)}%)`);

        // Get players for clubs in this league
        const clubIds = clubs?.map(c => c.id) || [];

        if (clubIds.length > 0) {
            // Get players linked to these clubs via topic_relationships
            const { data: playerRelations } = await supabase
                .from('topic_relationships')
                .select(`
                    child_id,
                    topics!topic_relationships_child_id_fkey (
                        id,
                        title,
                        slug,
                        metadata
                    )
                `)
                .in('parent_id', clubIds)
                .eq('relationship_type', 'plays_for');

            const players = playerRelations?.map((rel: any) => rel.topics).filter(Boolean) || [];

            console.log(`\n👤 PLAYERS (${players.length} total):`);
            let playersWithPhotos = 0;
            let playersWithoutPhotos = 0;

            // Show first 10 and last 10 as samples
            const samplePlayers = [
                ...players.slice(0, 10),
                ...(players.length > 20 ? players.slice(-10) : [])
            ];

            samplePlayers.forEach((player: any, idx: number) => {
                if (idx === 10 && players.length > 20) {
                    console.log(`  ... (${players.length - 20} players omitted) ...`);
                }

                const hasPhoto = !!player.metadata?.photo_url;
                if (hasPhoto) playersWithPhotos++;

                console.log(`  ${hasPhoto ? '✅' : '❌'} ${player.title}`);
                if (!hasPhoto) {
                    console.log(`     Metadata keys: ${Object.keys(player.metadata || {}).join(', ')}`);
                    console.log(`     TheSportsDB ID: ${player.metadata?.external?.thesportsdb_id || 'MISSING'}`);
                }
            });

            // Count all players
            players.forEach((p: any) => {
                if (p.metadata?.photo_url) playersWithPhotos++;
                else playersWithoutPhotos++;
            });

            console.log(`\n  📈 Photo Coverage: ${playersWithPhotos}/${players.length} (${Math.round((playersWithPhotos / (players.length || 1)) * 100)}%)`);
        }
    }

    // GLOBAL STATS
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('🌍 GLOBAL DATABASE STATS');
    console.log('='.repeat(70));

    const { data: allPlayers } = await supabase
        .from('topics')
        .select('id, metadata')
        .eq('type', 'player');

    const { data: allClubs } = await supabase
        .from('topics')
        .select('id, metadata')
        .eq('type', 'club');

    const playersWithPhotos = allPlayers?.filter((p: any) => p.metadata?.photo_url).length || 0;
    const clubsWithBadges = allClubs?.filter((c: any) => c.metadata?.badge_url).length || 0;

    console.log(`\n👤 All Players: ${playersWithPhotos}/${allPlayers?.length || 0} have photo_url (${Math.round((playersWithPhotos / (allPlayers?.length || 1)) * 100)}%)`);
    console.log(`🏟️  All Clubs: ${clubsWithBadges}/${allClubs?.length || 0} have badge_url (${Math.round((clubsWithBadges / (allClubs?.length || 1)) * 100)}%)`);

    // Check how many are STUBs
    const stubPlayers = allPlayers?.filter((p: any) => p.metadata?.is_stub).length || 0;
    const stubClubs = allClubs?.filter((c: any) => c.metadata?.is_stub).length || 0;

    console.log(`\n🏷️  STUB Topics:`);
    console.log(`   Players with is_stub=true: ${stubPlayers}/${allPlayers?.length || 0}`);
    console.log(`   Clubs with is_stub=true: ${stubClubs}/${allClubs?.length || 0}`);

    // Sample a player with NO photo to see what metadata they have
    const playerWithoutPhoto = allPlayers?.find((p: any) => !p.metadata?.photo_url);
    if (playerWithoutPhoto) {
        console.log(`\n🔎 Sample Player WITHOUT photo:`);
        console.log(JSON.stringify(playerWithoutPhoto, null, 2));
    }
}

comprehensiveImageAudit().catch(console.error);
