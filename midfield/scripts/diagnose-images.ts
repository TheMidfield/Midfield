import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkImagesInDatabase() {
    console.log('🔍 Investigating missing entity images...\n');

    // Sample players
    const { data: players, error: playersError } = await supabase
        .from('topics')
        .select('id, title, slug, metadata')
        .eq('type', 'player')
        .limit(20);

    if (playersError) {
        console.error('Error fetching players:', playersError);
        return;
    }

    console.log('📊 Sample Players (first 20):');
    console.log('================================');
    let playersWithPhotos = 0;
    let playersWithoutPhotos = 0;

    players?.forEach((player: any) => {
        const photoUrl = player.metadata?.photo_url;
        const hasPhoto = !!photoUrl;

        if (hasPhoto) playersWithPhotos++;
        else playersWithoutPhotos++;

        console.log(`${hasPhoto ? '✅' : '❌'} ${player.title} (${player.slug})`);
        if (photoUrl) {
            console.log(`   Photo: ${photoUrl.substring(0, 60)}...`);
        } else {
            console.log(`   metadata.photo_url: ${player.metadata?.photo_url || 'NULL'}`);
            console.log(`   Full metadata keys: ${Object.keys(player.metadata || {}).join(', ')}`);
        }
    });

    console.log(`\n📈 Player Stats: ${playersWithPhotos}/${players?.length} have photos\n`);

    // Sample clubs
    const { data: clubs, error: clubsError } = await supabase
        .from('topics')
        .select('id, title, slug, metadata')
        .eq('type', 'club')
        .limit(20);

    if (clubsError) {
        console.error('Error fetching clubs:', clubsError);
        return;
    }

    console.log('\n🏟️  Sample Clubs (first 20):');
    console.log('================================');
    let clubsWithBadges = 0;
    let clubsWithoutBadges = 0;

    clubs?.forEach((club: any) => {
        const badgeUrl = club.metadata?.badge_url;
        const hasBadge = !!badgeUrl;

        if (hasBadge) clubsWithBadges++;
        else clubsWithoutBadges++;

        console.log(`${hasBadge ? '✅' : '❌'} ${club.title} (${club.slug})`);
        if (badgeUrl) {
            console.log(`   Badge: ${badgeUrl.substring(0, 60)}...`);
        } else {
            console.log(`   metadata.badge_url: ${club.metadata?.badge_url || 'NULL'}`);
            console.log(`   Full metadata keys: ${Object.keys(club.metadata || {}).join(', ')}`);
        }
    });

    console.log(`\n📈 Club Stats: ${clubsWithBadges}/${clubs?.length} have badges\n`);

    // Check if it's a nested structure issue
    console.log('\n🔎 Detailed investigation of first player:');
    if (players && players.length > 0) {
        console.log(JSON.stringify(players[0], null, 2));
    }
}

checkImagesInDatabase().catch(console.error);
