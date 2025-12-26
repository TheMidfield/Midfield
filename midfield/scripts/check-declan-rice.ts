import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDeclanRice() {
    console.log('Checking Declan Rice records...\n');

    const { data: players } = await supabase
        .from('topics')
        .select('*')
        .ilike('title', '%declan%rice%')
        .eq('type', 'player');

    console.log(`Found ${players?.length || 0} records\n`);

    players?.forEach(p => {
        console.log(`Title: ${p.title}`);
        console.log(`Slug: ${p.slug}`);
        console.log(`ID: ${p.id}`);
        console.log(`Active: ${p.is_active}`);
        console.log(`TheSportsDB ID: ${p.metadata?.external?.thesportsdb_id || 'MISSING'}`);
        console.log(`Created: ${p.created_at}`);
        console.log('---');
    });

    // Check if slug 'declan-rice' exists
    const { data: bySlug } = await supabase
        .from('topics')
        .select('*')
        .eq('slug', 'declan-rice')
        .eq('type', 'player')
        .maybeSingle();

    if (bySlug) {
        console.log('\n⚠️  Found player with slug "declan-rice":');
        console.log(JSON.stringify(bySlug, null, 2));
    } else {
        console.log('\n✅ No player with slug "declan-rice" exists');
    }
}

checkDeclanRice();
