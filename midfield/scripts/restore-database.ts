
import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { syncDailySchedules, syncClubSchedules } from '../packages/logic/src/sync/simple-fixture-sync';
import { config } from 'dotenv';
config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!);

    console.log('🚨 EMERGENCY RESTORATION STARTED 🚨');

    // 1. Core League Sync
    console.log('\nSTEP 1: Syncing Daily Schedules (Core Leagues)...');
    await syncDailySchedules(supabase, apiClient);

    // 2. Club Specific Sync
    console.log('\nSTEP 2: Syncing Club Schedules (Core Clubs Only)...');
    await syncClubSchedules(supabase, apiClient); // This now has the filter fix

    console.log('\n✅ RESTORATION COMPLETED');
}

main().catch(console.error);
