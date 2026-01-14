import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
    // Test 1: Find Bruno by thesportsdb_id
    const { data: byId, error: err1 } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'player')
        .filter('metadata->external->>thesportsdb_id', 'eq', '34163007')
        .maybeSingle();

    console.log('=== Test 1: Filter by thesportsdb_id (string) ===');
    console.log('Found:', byId?.title || 'NOT FOUND');
    console.log('Error:', err1?.message || 'none');
    console.log('Current photo_url:', (byId?.metadata as any)?.photo_url);

    // Test 2: Find Bruno by slug
    const { data: bySlug } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('slug', 'bruno-fernandes')
        .maybeSingle();

    console.log('\n=== Test 2: Find by slug ===');
    console.log('Found:', bySlug?.title || 'NOT FOUND');
    console.log('thesportsdb_id in DB:', (bySlug?.metadata as any)?.external?.thesportsdb_id);
    console.log('Current photo_url:', (bySlug?.metadata as any)?.photo_url);

    // Test 3: Try to update Bruno directly
    if (bySlug) {
        console.log('\n=== Test 3: Direct update ===');
        const newPhotoUrl = 'https://r2.thesportsdb.com/images/media/player/cutout/jhasls1766826690.png';
        const { error: updateError } = await supabase
            .from('topics')
            .update({
                metadata: {
                    ...(bySlug.metadata as object),
                    photo_url: newPhotoUrl
                }
            })
            .eq('id', bySlug.id);

        console.log('Update error:', updateError?.message || 'SUCCESS');

        // Re-fetch to verify
        const { data: afterUpdate } = await supabase
            .from('topics')
            .select('metadata')
            .eq('id', bySlug.id)
            .single();

        console.log('Photo URL after update:', (afterUpdate?.metadata as any)?.photo_url);
    }
}

test();
