import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { processSyncJobs } from '../packages/logic/src/sync/worker';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!);

async function main() {
    console.log('Running worker LOCALLY...');
    // Process up to 50 jobs (5 batches of 10) to be safe
    await processSyncJobs(supabase, apiClient, 50);
    console.log('Done.');
}

main().catch(console.error);
