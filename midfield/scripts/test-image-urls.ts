import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testImageUrls() {
    console.log('🔍 TESTING THESPORTSDB IMAGE URLS\n');

    // Get a sample of players with images
    const { data: players } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'player')
        .not('metadata->photo_url', 'is', null)
        .limit(10);

    console.log(`Testing ${players?.length} player image URLs...\n`);

    for (const player of players || []) {
        const photoUrl = player.metadata?.photo_url;
        console.log(`\n${player.title}:`);
        console.log(`  URL: ${photoUrl}`);

        if (photoUrl) {
            try {
                const response = await fetch(photoUrl, { method: 'HEAD' });
                console.log(`  Status: ${response.status} ${response.statusText}`);
                console.log(`  Content-Type: ${response.headers.get('content-type')}`);
                console.log(`  ✅ Image is accessible`);
            } catch (error: any) {
                console.log(`  ❌ ERROR: ${error.message}`);
            }
        }
    }

    // Sample club badges too
    const { data: clubs } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'club')
        .not('metadata->badge_url', 'is', null)
        .limit(5);

    console.log(`\n\nTesting ${clubs?.length} club badge URLs...\n`);

    for (const club of clubs || []) {
        const badgeUrl = club.metadata?.badge_url;
        console.log(`\n${club.title}:`);
        console.log(`  URL: ${badgeUrl}`);

        if (badgeUrl) {
            try {
                const response = await fetch(badgeUrl, { method: 'HEAD' });
                console.log(`  Status: ${response.status} ${response.statusText}`);
                console.log(`  Content-Type: ${response.headers.get('content-type')}`);
                console.log(`  ✅ Badge is accessible`);
            } catch (error: any) {
                console.log(`  ❌ ERROR: ${error.message}`);
            }
        }
    }
}

testImageUrls().catch(console.error);
