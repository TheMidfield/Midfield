// Manual test of the daily sync to verify it works
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Import the sync function
import { syncDailySchedules } from '../packages/logic/src/sync/simple-fixture-sync';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';

async function main() {
    console.log('\n=== MANUAL SYNC TEST ===\n');
    console.log('Starting sync at:', new Date().toISOString());

    const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!);

    try {
        await syncDailySchedules(supabase as any, apiClient);
        console.log('\n✅ Sync completed successfully');
    } catch (err) {
        console.error('\n❌ Sync failed:', err);
    }

    // Check if Sunderland vs Man City was updated
    const { data: match } = await supabase
        .from('fixtures')
        .select('id, status, home_score, away_score, updated_at')
        .eq('id', 2267261)
        .single();

    console.log('\n=== POST-SYNC CHECK ===');
    console.log('Sunderland vs Man City (ID 2267261):');
    console.log(`  Status: ${match?.status}`);
    console.log(`  Score: ${match?.home_score} - ${match?.away_score}`);
    console.log(`  Updated: ${match?.updated_at}`);
}

main().catch(console.error);
