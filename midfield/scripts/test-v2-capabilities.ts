
import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

const API_KEY = process.env.THESPORTSDB_API_KEY;
const V1_BASE = 'https://www.thesportsdb.com/api/v1/json';
const V2_BASE = 'https://www.thesportsdb.com/api/v2/json';

if (!API_KEY) {
    console.error('❌ Missing THESPORTSDB_API_KEY');
    process.exit(1);
}

// ARSENAL ID: 133604
// EPL ID: 4328

async function fetchV2(endpoint: string) {
    const url = `${V2_BASE}${endpoint}`;
    console.log(`\n🔍 Fetching V2: ${endpoint}`);
    try {
        const res = await fetch(url, { headers: { 'X-API-KEY': API_KEY! } });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return await res.json();
    } catch (e) {
        console.error(`   ❌ Error: ${e.message}`);
        return null;
    }
}

async function fetchV1(endpoint: string) {
    // V1 Premium URL format: .../v1/json/{API_KEY}/{endpoint}
    const url = `${V1_BASE}/${API_KEY}/${endpoint}`;
    console.log(`\n🔍 Fetching V1: ${endpoint}`);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return await res.json();
    } catch (e) {
        console.error(`   ❌ Error: ${e.message}`);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Checking TheSportsDB Capabilities...\n');

    // 1. FIXTURES (Recent Form & Upcoming)
    console.log('--- 1. TEAM FIXTURES ---');
    // Test V2 Schedule endpoints
    // Next 5
    const nextMatches = await fetchV2('/schedule/next/team/133604');
    if (nextMatches?.schedule) {
        console.log(`   ✅ Next Matches: Found ${nextMatches.schedule.length}`);
        console.log(`      Sample: ${nextMatches.schedule[0].strEvent} (${nextMatches.schedule[0].dateEvent})`);
    } else {
        console.log('   ⚠️ No "schedule" key found.', nextMatches);
    }

    // Previous 5 (Form)
    const lastMatches = await fetchV2('/schedule/previous/team/133604');
    if (lastMatches?.schedule) {
        console.log(`   ✅ Last Matches: Found ${lastMatches.schedule.length}`);
        console.log(`      Sample: ${lastMatches.schedule[0].strEvent} (${lastMatches.schedule[0].intHomeScore}-${lastMatches.schedule[0].intAwayScore})`);
    }

    // 2. LEAGUE STANDINGS
    console.log('\n--- 2. LEAGUE STANDINGS ---');
    // Try V1 lookuptable.php (Premium)
    const standings = await fetchV1('lookuptable.php?l=4328&s=2024-2025');
    if (standings?.table) {
        console.log(`   ✅ League Table: Found ${standings.table.length} rows`);
        const leader = standings.table[0];
        console.log(`      Leader: #${leader.intRank} ${leader.strTeam} (${leader.intPoints} pts)`);
    } else {
        console.log('   ⚠️ V1 Table fetch failed.', standings);
    }

    // 3. PLAYER DATA (Contracts & Honours)
    console.log('\n--- 3. PLAYER DEEP DATA ---');
    // Bukayo Saka ID: 34161044
    // Contracts
    const contracts = await fetchV2('/lookup/player_contracts/34161044');
    // Note: V2 seems to return 'lookup' or maybe 'contracts' inside? Based on previous run, key was 'lookup'
    const contractData = contracts?.contracts || contracts?.lookup;

    if (contractData) {
        console.log(`   ✅ Contracts: Found ${contractData.length}`);
        console.log(`      Sample: ${contractData[0].strTeam} (${contractData[0].strWage})`);
    } else {
        console.log('   ⚠️ No contracts found. Response keys:', Object.keys(contracts || {}));
    }

    // Honours - V2 Failed ("Message"), trying V1 fallback
    console.log('   (Trying V1 Honours...)');
    const honours = await fetchV1('lookuphonours.php?id=34161044');
    if (honours?.honours) {
        console.log(`   ✅ Honours (V1): Found ${honours.honours.length}`);
        console.log(`      Sample: ${honours.honours[0].strHonour} (${honours.honours[0].strSeason})`);
    } else {
        console.log('   ⚠️ Honours fetch failed.', honours);
    }
}

runTests();
