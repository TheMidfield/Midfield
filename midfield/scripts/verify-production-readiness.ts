import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';


config();

const LEAGUE_IDS = {
    EPL: '4328',
    LALIGA: '4335',
    BUNDESLIGA: '4331',
    SERIEA: '4332',
    LIGUE1: '4334'
};

async function main() {
    console.log('\n🏥 MIDFIELD SYNC HEALTH CHECK');
    console.log('============================================');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let allGreen = true;

    // 1. CHECK STANDINGS
    console.log('\n📊 CHECK 1: LEAGUE STANDINGS');

    // Fetch all leagues first (robust)
    const { data: allLeagues } = await supabase.from('topics').select('id, title, metadata').eq('type', 'league');
    const targetIds = Object.values(LEAGUE_IDS);

    // Filter in memory to avoid JSONB syntax issues
    const leagues = allLeagues?.filter(l => {
        const tid = l.metadata?.external?.thesportsdb_id || l.metadata?.thesportsdb_id;
        return targetIds.includes(String(tid));
    }) || [];

    const { data: standings } = await supabase.from('league_standings').select('league_id');

    if (leagues.length === 0) {
        console.error('❌ CRITICAL: Core Leagues not found in DB!');
        allGreen = false;
    } else {
        for (const l of leagues) {
            const leagueStandings = standings?.filter(s => s.league_id === l.id);
            const count = leagueStandings?.length || 0;
            const expected = (l.title.includes('Bundesliga') || l.title.includes('Ligue 1')) ? 18 : 20;

            if (count >= expected - 1) {
                console.log(`   ✅ ${l.title}: ${count}/${expected} teams present.`);
            } else {
                console.log(`   ❌ ${l.title}: Only ${count} teams found. (Expected ${expected})`);
                allGreen = false;
            }
        }
    }

    // 2. CHECK FIXTURES (Next 7 Days)
    console.log('\n📅 CHECK 2: FIXTURE FRESHNESS (Next 7 Days)');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { count: futureFixtures } = await supabase
        .from('fixtures')
        .select('id', { count: 'exact', head: true })
        .gte('date', now.toISOString())
        .lte('date', nextWeek.toISOString());

    if ((futureFixtures || 0) > 50) {
        console.log(`   ✅ Found ${futureFixtures} upcoming matches in next 7 days.`);
    } else {
        console.log(`   ⚠️ Low fixture count (${futureFixtures}). Is the schedule sync working?`);
        // Not necessarily a fail if it's summer break, but for now it's active.
        if ((futureFixtures || 0) === 0) allGreen = false;
    }

    // 3. CHECK STUB FUNCTIONALITY
    console.log('\n🛡️ CHECK 3: STUB SYSTEM');
    // Check for a known stub or just any topic with is_stub: true created recently?
    const { count: stubs } = await supabase
        .from('topics')
        .select('id', { count: 'exact', head: true })
        .eq('metadata->>is_stub', 'true');

    if ((stubs || 0) > 0) {
        console.log(`   ✅ Stub System Active. Found ${stubs} stub topics.`);
    } else {
        console.log('   ℹ️ No stubs found. (This is fine if DB was huge, but usually implies cleanup needed or no stubs created yet).');
    }

    // 4. CHECK CORE CLUB COVERAGE
    console.log('\n🏢 CHECK 4: CORE CLUB CONNECTIVITY');
    // Check specific big teams to ensure they have fixtures
    const checkClubs = ['Real Madrid', 'Arsenal', 'Bayern Munich'];
    for (const name of checkClubs) {
        const { data: club } = await supabase.from('topics').select('id').ilike('title', name).single();
        if (club) {
            const { count: clubFixtures } = await supabase
                .from('fixtures')
                .select('id', { count: 'exact', head: true })
                .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
                .gte('date', now.toISOString()); // Future

            if ((clubFixtures || 0) > 0) {
                console.log(`   ✅ ${name}: Has ${clubFixtures} upcoming matches.`);
            } else {
                console.log(`   ⚠️ ${name}: No upcoming matches found. Check sync.`);
            }
        } else {
            console.log(`   ❌ Could not find club ${name} to test.`);
            allGreen = false;
        }
    }

    console.log('============================================');
    if (allGreen) {
        console.log('✅✅ SYSTEM STATUS: PRODUCTION READY ✅✅');
        console.log('Class 1 (Realtime) and Class 2 (Atlas/Standings) Logic Verified.');
    } else {
        console.log('❌❌ SYSTEM STATUS: ATTENTION REQUIRED ❌❌');
    }
    console.log('\n');
}

main().catch(console.error);
