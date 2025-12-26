
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
    console.log('🚀 Verifying Auxiliary Data Synchronization...');

    // 1. Insert Sync Jobs
    console.log('1️⃣  Inserting Jobs (Fixtures & Standings for Premier League: 4328)...');

    // Clear old jobs for clarity
    await supabase.from('sync_jobs').delete().in('status', ['pending', 'processing', 'completed', 'failed']);

    const { data: jobs, error } = await supabase.from('sync_jobs').insert([
        {
            job_type: 'sync_fixtures',
            payload: { leagueId: '4328', season: '2024-2025' },
            status: 'pending'
        },
        {
            job_type: 'sync_standings',
            payload: { leagueId: '4328', season: '2024-2025' },
            status: 'pending'
        }
    ]).select();

    if (error) {
        console.error('❌ Failed to insert jobs:', error);
        return;
    }
    console.log(`   ✅ Queued ${jobs.length} jobs.`);

    // 2. Trigger Worker
    console.log('\n2️⃣  Triggering Sync Worker (Edge Function)...');
    // Using default anon key for invocation (or service role if needed, but functions usually restricted)
    // Assuming function is deployed and accessible via public URL or requires Auth
    // We'll use service role key in Authorization header to be safe
    const functionUrl = `${supabaseUrl}/functions/v1/sync-worker`;

    try {
        const res = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`❌ Worker invocation failed: ${res.status} ${text}`);
        } else {
            const json = await res.json();
            console.log('   ✅ Worker response:', json);
        }
    } catch (e) {
        console.error('❌ Failed to call worker:', e);
    }

    // 3. Poll & Verify
    console.log('\n3️⃣  Checking Database Results (Wait 5s)...');
    await sleep(5000);

    // Check Jobs
    const { data: finalJobs } = await supabase.from('sync_jobs').select('*');
    console.log('   Job Statuses:', finalJobs?.map(j => `${j.job_type}: ${j.status}`));

    // Check Fixtures
    const { count: fixtureCount } = await supabase.from('fixtures').select('*', { count: 'exact', head: true });
    console.log(`\n   🏟️  Fixtures Count: ${fixtureCount}`);

    // Check Standings
    const { count: standingsCount } = await supabase.from('league_standings').select('*', { count: 'exact', head: true });
    console.log(`   🏆 Standings Rows: ${standingsCount}`);

    if (standingsCount && standingsCount > 0) {
        const { data: top3 } = await supabase.from('league_standings').select('rank, points, topics!team_id(title)').order('rank').limit(3);
        console.log('      Top 3:', top3?.map(t => `#${t.rank} ${t.topics.title} (${t.points})`));
    }
}

runVerification();
