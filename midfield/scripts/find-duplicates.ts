import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findDuplicatePlayers() {
    console.log('Finding duplicate players...\n');

    // Get all players
    const { data: allPlayers } = await supabase
        .from('topics')
        .select('id, title, slug, metadata, is_active')
        .eq('type', 'player');

    // Group by normalized title (lowercase, no spaces)
    const playersByName = new Map<string, any[]>();

    allPlayers?.forEach(player => {
        const normalizedName = player.title.toLowerCase().replace(/\s+/g, '-');
        if (!playersByName.has(normalizedName)) {
            playersByName.set(normalizedName, []);
        }
        playersByName.get(normalizedName)!.push(player);
    });

    // Find duplicates
    const duplicates = Array.from(playersByName.entries())
        .filter(([_, players]) => players.length > 1);

    console.log(`Found ${duplicates.length} players with duplicate records\n`);

    if (duplicates.length > 0) {
        console.log('Top 20 duplicates:\n');
        duplicates.slice(0, 20).forEach(([name, players]) => {
            console.log(`${name}:`);
            players.forEach(p => {
                const hasId = p.metadata?.external?.thesportsdb_id;
                console.log(`  - slug: "${p.slug}" | active: ${p.is_active} | has_api_id: ${!!hasId}`);
            });
            console.log('');
        });
    }

    // Count players without TheSportsDB ID
    const withoutId = allPlayers?.filter(p => !p.metadata?.external?.thesportsdb_id) || [];
    console.log(`\nPlayers without TheSportsDB ID: ${withoutId.length}`);

    if (withoutId.length > 0) {
        console.log('Sample (first 10):');
        withoutId.slice(0, 10).forEach(p => {
            console.log(`  - ${p.title} (slug: ${p.slug})`);
        });
    }
}

findDuplicatePlayers();
