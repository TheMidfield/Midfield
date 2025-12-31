
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { syncDailySchedules } from '../packages/logic/src/sync/simple-fixture-sync';

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tsdbKey = process.env.THESPORTSDB_API_KEY;

if (!supabaseUrl || !supabaseKey || !tsdbKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const tsdb = new TheSportsDBClient(tsdbKey);

async function run() {
    console.log('Running Verification for V2 Sync...');
    await syncDailySchedules(supabase, tsdb);
    console.log('Done.');
}

run().catch(console.error);
