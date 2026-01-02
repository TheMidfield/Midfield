import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { config } from 'dotenv';

config();

async function main() {
    console.log('🕵️‍♀️ DEBUG: Finding Missing Standings Links');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY || '3');

    // Serie A (4332) and La Liga (4335)
    const TARGETS = [
        { id: '4335', name: 'La Liga' },
        { id: '4332', name: 'Serie A' }
    ];

    for (const league of TARGETS) {
        console.log(`\nAnalyzing ${league.name}...`);
        const table = await apiClient.getLeagueTable(league.id, '2024-2025');

        // Fetch all clubs that claim to be in this league and have a TSDB ID
        // Actually, let's just reverse check:
        // For each row in table, do we have a club with that ID?

        for (const row of table) {
            const { data } = await supabase
                .from('topics')
                .select('id, title')
                .eq('type', 'club')
                // Use the text search or strict equivalence if possible for JSONB
                // But simple select is safer
                .eq('metadata->external->>thesportsdb_id', row.idTeam)
                .maybeSingle();

            if (!data) {
                console.log(`   ❌ MISSING LINK: ${row.strTeam} (ID: ${row.idTeam})`);
                // Let's see if we have them by name?
                const { data: byName } = await supabase.from('topics').select('id, title, metadata').ilike('title', row.strTeam).maybeSingle();
                if (byName) {
                    console.log(`      Found by name: "${byName.title}" -> Attempting Auto-Fix...`);
                    // Update the ID
                    if (!byName.metadata) byName.metadata = {};
                    if (!byName.metadata.external) byName.metadata.external = {};
                    byName.metadata.external.thesportsdb_id = row.idTeam;
                    byName.metadata.external.source = 'thesportsdb';

                    const { error } = await supabase.from('topics').update({ metadata: byName.metadata }).eq('id', byName.id);
                    if (!error) console.log(`      ✅ Fixed ID for ${byName.title}`);
                    else console.error(`      ⚠️ Failed to fix:`, error);
                } else {
                    console.log(`      ⚠️ Club totally missing from DB?`);
                }
            }
        }
    }
}

main().catch(console.error);
