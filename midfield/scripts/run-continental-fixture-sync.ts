import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { syncDailySchedules } from '../packages/logic/src/sync/simple-fixture-sync';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!);

async function main() {
    console.log('Starting fixture sync for Continental Leagues...');
    // Sync Champions League (4480) and Europa League (4481)
    await syncDailySchedules(supabase, apiClient, ['4480', '4481']);
    console.log('Done!');
}

main().catch(err => console.error(err));
