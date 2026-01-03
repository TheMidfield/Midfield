import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), 'midfield/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'midfield/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDeployment() {
    console.log('🔍 Verifying Sync Architecture...\n');

    // 1. Check Livescores (Fixtures updated in last 15 mins)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: recentFixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select('id, home_team_name, away_team_name, status, updated_at')
        .gt('updated_at', fifteenMinutesAgo)
        .limit(5);

    if (fixturesError) {
        console.error('❌ Failed to query fixtures:', fixturesError.message);
    } else if (recentFixtures && recentFixtures.length > 0) {
        console.log('✅ [LIVESCORES] Working! Found fixtures updated in last 15 mins:');
        recentFixtures.forEach(f => {
            console.log(`   - ${f.home_team_name} vs ${f.away_team_name} [${f.status}] (@ ${new Date(f.updated_at).toLocaleTimeString()})`);
        });
    } else {
        console.log('⚠️ [LIVESCORES] No fixtures updated in last 15 mins.');
        console.log('   (This is normal if no matches are currently live/active)');

        // Check if there are ANY live matches that SHOULD be updating
        const { count } = await supabase
            .from('fixtures')
            .select('*', { count: 'exact', head: true })
            .in('status', ['LIVE', 'HT', '1H', '2H', 'ET', 'PEN']);

        if (count && count > 0) {
            console.log(`   ⚠️ WARNING: There are ${count} LIVE matches in DB but they are not updating! Check Edge Function logs.`);
        } else {
            console.log('   ℹ️ No LIVE matches currently in progress. Sync is likely sleeping (correct behavior).');
        }
    }

    // 2. Check Daily Schedule (Last successful sync log?)
    // We don't have a sync_logs table anymore, so we rely on GitHub Actions status which user must check.
    console.log('\n✅ [DAILY SCHEDULE] Managed by GitHub Actions.');
    console.log('   👉 Please trigger "Daily Schedule & Standings Sync" manually in GitHub Actions tab to verify.');

    console.log('\n✅ [WEEKLY METADATA] Managed by GitHub Actions.');
    console.log('   👉 Next run: Sunday 3 AM UTC.');

    console.log('\n🏁 Verification Check Complete');
}

verifyDeployment();
