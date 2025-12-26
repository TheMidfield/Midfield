
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
    if (nextMatches?.results) {
        console.log(`   ✅ Next Matches: Found ${nextMatches.results.length}`);
        console.log(`      Sample: ${nextMatches.results[0].strEvent} (${nextMatches.results[0].dateEvent})`);
    }

    // Previous 5 (Form)
    const lastMatches = await fetchV2('/schedule/previous/team/133604');
    if (lastMatches?.results) {
        console.log(`   ✅ Last Matches: Found ${lastMatches.results.length}`);
        console.log(`      Sample: ${lastMatches.results[0].strEvent} (${lastMatches.results[0].intHomeScore}-${lastMatches.results[0].intAwayScore})`);
    }

    // 2. LEAGUE STANDINGS
    console.log('\n--- 2. LEAGUE STANDINGS ---');
    // Try V1 lookuptable.php (Premium)
    const standings = await fetchV1('lookuptable.php?l=4328&s=2024-2025');
    if (standings?.table) {
        console.log(`   ✅ League Table: Found ${standings.table.length} rows`);
        console.log(`      Leader: #${standings.table[0].intRank} ${standings.table[0].strTeam} (${standings.table[0].intPoints} pts)`);
    } else {
        console.log('   ⚠️ V1 Table fetch failed or empty (might need season adjustment?)');
    }

    // 3. PLAYER DATA (Contracts & Honours)
    console.log('\n--- 3. PLAYER DEEP DATA ---');
    // Bukayo Saka ID: 34161044
    // Contracts
    const contracts = await fetchV2('/lookup/player_contracts/34161044');
    if (contracts?.contracts) {
        console.log(`   ✅ Contracts: Found ${contracts.contracts.length}`);
        console.log(`      Sample: ${contracts.contracts[0].strTeam} (${contracts.contracts[0].strWage})`);
    }

    // Honours
    const honours = await fetchV2('/lookup/player_honours/34161044');
    if (honours?.honours) {
        console.log(`   ✅ Honours: Found ${honours.honours.length}`);
        console.log(`      Sample: ${honours.honours[0].strHonour} (${honours.honours[0].strSeason})`);
    }
}

runTests();
