import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    console.log('\n=== FIXTURE DATABASE AUDIT ===\n');

    // 1. Count total fixtures
    const { count: totalFixtures } = await supabase
        .from('fixtures')
        .select('*', { count: 'exact', head: true });
    console.log(`Total fixtures in DB: ${totalFixtures}`);

    // 2. Latest fixture date
    const { data: latestFixture } = await supabase
        .from('fixtures')
        .select('date, id')
        .order('date', { ascending: false })
        .limit(1)
        .single();
    console.log(`Most recent fixture date: ${latestFixture?.date}`);

    // 3. Last updated fixture
    const { data: lastUpdated } = await supabase
        .from('fixtures')
        .select('updated_at, id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
    console.log(`Last DB update: ${lastUpdated?.updated_at}`);

    // 4. Check for Jan 1, 2026 fixtures
    const jan1 = '2026-01-01';
    const jan2 = '2026-01-02';
    const { data: jan1Fixtures, count: jan1Count } = await supabase
        .from('fixtures')
        .select('*', { count: 'exact' })
        .gte('date', jan1)
        .lt('date', jan2);
    console.log(`\nFixtures on Jan 1, 2026: ${jan1Count}`);

    // 5. Check if Sunderland vs Man City exists (event ID from API: 2267261)
    const { data: specificMatch } = await supabase
        .from('fixtures')
        .select('*')
        .eq('id', 2267261)
        .maybeSingle();
    console.log(`\nSunderland vs Man City (ID 2267261):`);
    console.log(specificMatch ? '  ✅ EXISTS in DB' : '  ❌ NOT in DB');
    if (specificMatch) {
        console.log(`  Status: ${specificMatch.status}`);
        console.log(`  Score: ${specificMatch.home_score} - ${specificMatch.away_score}`);
    }

    // 6. Recent fixtures (last 5 by date)
    const { data: recentFixtures } = await supabase
        .from('fixtures')
        .select('id, date, status, home_score, away_score, home_team_name, away_team_name')
        .order('date', { ascending: false })
        .limit(5);
    console.log('\n=== 5 Most Recent Fixtures ===');
    recentFixtures?.forEach(f => {
        console.log(`  ${f.date?.substring(0, 10)} | ${f.home_team_name} ${f.home_score ?? '-'} - ${f.away_score ?? '-'} ${f.away_team_name} | ${f.status}`);
    });

    // 7. Check for any LIVE or recent FT matches
    const { data: liveMatches, count: liveCount } = await supabase
        .from('fixtures')
        .select('*', { count: 'exact' })
        .in('status', ['LIVE', 'HT']);
    console.log(`\nCurrently LIVE/HT matches: ${liveCount}`);
}

main().catch(console.error);
