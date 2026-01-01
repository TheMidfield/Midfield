import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateNullImages() {
    console.log('🔍 INVESTIGATING NULL PHOTO URLs\n');

    // Get all leagues to see what names they have
    const { data: allLeagues } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'league')
        .order('title');

    console.log('📋 All Leagues in DB:');
    allLeagues?.forEach((l: any) => {
        console.log(`  - ${l.title}`);
    });

    // Get players with null photo_url
    const { data: playersWithNull } = await supabase
        .from('topics')
        .select('id, title, slug, metadata')
        .eq('type', 'player')
        .is('metadata->photo_url', null)
        .limit(30);

    console.log(`\n\n🚨 Players with photo_url = null (showing 30 samples):`);
    console.log('='.repeat(70));

    playersWithNull?.forEach((player: any, idx: number) => {
        console.log(`\n${idx + 1}. ${player.title} (${player.slug})`);
        console.log(`   TheSportsDB ID: ${player.metadata?.external?.thesportsdb_id || 'MISSING'}`);
        console.log(`   Position: ${player.metadata?.position || 'Unknown'}`);
        console.log(`   Has photo_url key: ${player.metadata.hasOwnProperty('photo_url')}`);
        console.log(`   photo_url value: ${player.metadata?.photo_url}`);

        // Check if there's a render_url or cutout field instead
        const altUrls = [];
        if (player.metadata?.render_url) altUrls.push(`render_url: ${player.metadata.render_url.substring(0, 50)}...`);
        if (player.metadata?.cutout_url) altUrls.push(`cutout_url: ${player.metadata.cutout_url.substring(0, 50)}...`);
        if (player.metadata?.thumb_url) altUrls.push(`thumb_url: ${player.metadata.thumb_url.substring(0, 50)}...`);

        if (altUrls.length > 0) {
            console.log(`   Alternative URLs found: ${altUrls.join(', ')}`);
        }
    });

    // Check clubs with null badge_url (excluding STUBs)
    const { data: clubsWithNull } = await supabase
        .from('topics')
        .select('id, title, slug, metadata')
        .eq('type', 'club')
        .is('metadata->badge_url', null)
        .limit(20);

    console.log(`\n\n🏟️  Clubs with badge_url = null (showing 20 samples):`);
    console.log('='.repeat(70));

    clubsWithNull?.forEach((club: any, idx: number) => {
        const isStub = club.metadata?.is_stub;
        console.log(`\n${idx + 1}. ${club.title} ${isStub ? '(STUB)' : ''}`);
        console.log(`   TheSportsDB ID: ${club.metadata?.external?.thesportsdb_id || 'MISSING'}`);
        console.log(`   Has badge_url key: ${club.metadata.hasOwnProperty('badge_url')}`);
        console.log(`   badge_url value: ${club.metadata?.badge_url}`);
        console.log(`   Metadata keys: ${Object.keys(club.metadata || {}).join(', ')}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`Players with null photos: ${playersWithNull?.length || 0}`);
    console.log(`Clubs with null badges: ${clubsWithNull?.length || 0}`);
}

investigateNullImages().catch(console.error);
