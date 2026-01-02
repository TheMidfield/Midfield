import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { syncLeagueStandings } from '../packages/logic/src/sync/simple-fixture-sync';
import { config } from 'dotenv';

config();

async function main() {
    console.log('🧪 Testing League Standings Sync...');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY || '3');

    console.log('--- STARTING SYNC ---');
    await syncLeagueStandings(supabase, apiClient);
    console.log('--- SYNC FINISHED ---');

    // Verify
    const { count, error } = await supabase.from('league_standings').select('*', { count: 'exact', head: true });
    if (error) console.error('Verification failed:', error);
    else console.log(`\n✅ Verified: league_standings table now has ${count} rows.`);
}

main().catch(console.error);
