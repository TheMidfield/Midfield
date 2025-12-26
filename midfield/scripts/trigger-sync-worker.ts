import { config } from 'dotenv';
config();

const WORKER_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', 'https://') + '/functions/v1/sync-worker';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function triggerWorker(iterations = 10) {
    console.log(`🚀 Triggering sync-worker (${iterations} iterations)...\n`);

    for (let i = 0; i < iterations; i++) {
        const res = await fetch(WORKER_URL!, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        console.log(`Iteration ${i + 1}: Processed ${result.processed} jobs`);

        if (result.processed === 0) {
            console.log('✅ No more pending jobs. Done!');
            break;
        }

        // Wait 2s between iterations to respect rate limits
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n✨ Worker run complete!');
}

const iterations = parseInt(process.argv[2] || '10');
triggerWorker(iterations);
