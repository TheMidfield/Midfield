import { createClient } from '@supabase/supabase-js';
import { scheduleDailySync } from '../packages/logic/src/sync/scheduler';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('Scheduling daily sync...');
    const result = await scheduleDailySync(supabase);
    console.log('Queued jobs:', result.queued);
}

main().catch(err => console.error(err));
