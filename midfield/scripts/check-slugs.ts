import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPlayerSlugs() {
    console.log('Checking player slugs...\n');

    // Find players with null or empty slugs
    const { data: playersWithoutSlugs, error } = await supabase
        .from('topics')
        .select('id, title, slug')
        .eq('type', 'player')
        .or('slug.is.null,slug.eq.');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Players missing slugs: ${playersWithoutSlugs?.length || 0}`);

    if (playersWithoutSlugs && playersWithoutSlugs.length > 0) {
        console.log('\nSample players without slugs:');
        playersWithoutSlugs.slice(0, 10).forEach(p => {
            console.log(`  - ${p.title} (slug: "${p.slug}")`);
        });
    }

    // Check for duplicate slugs
    const { data: allPlayers } = await supabase
        .from('topics')
        .select('slug')
        .eq('type', 'player');

    const slugCounts = new Map<string, number>();
    allPlayers?.forEach(p => {
        if (p.slug) {
            slugCounts.set(p.slug, (slugCounts.get(p.slug) || 0) + 1);
        }
    });

    const duplicates = Array.from(slugCounts.entries()).filter(([_, count]) => count > 1);
    console.log(`\nDuplicate slugs: ${duplicates.length}`);

    if (duplicates.length > 0) {
        console.log('\nSample duplicate slugs:');
        duplicates.slice(0, 10).forEach(([slug, count]) => {
            console.log(`  - "${slug}" (${count} players)`);
        });
    }
}

checkPlayerSlugs();
