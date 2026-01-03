#!/usr/bin/env tsx
/**
 * Daily Schedule & Standings Sync Script
 * Runs every 6 hours via GitHub Actions
 * Replaces /api/cron/daily-schedule (Vercel)
 */

import { createClient } from '@supabase/supabase-js';
import {
    syncDailySchedules,
    syncClubSchedules,
    syncLeagueStandings
} from '../packages/logic/src/sync/simple-fixture-sync';
import { CORE_LEAGUES, getLeagueName } from '../packages/logic/src/config/leagues';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { config } from 'dotenv';

config();

async function main() {
    console.log('📅 [DAILY SYNC] Starting...');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // Validate environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const API_KEY = process.env.THESPORTSDB_API_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY || !API_KEY) {
        console.error('❌ Missing required environment variables:');
        if (!SUPABASE_URL) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
        if (!SUPABASE_KEY) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
        if (!API_KEY) console.error('  - THESPORTSDB_API_KEY');
        process.exit(1);
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const apiClient = new TheSportsDBClient(API_KEY);

        console.log('--- STEP 1: Sync League Schedules ---');
        await syncDailySchedules(supabase, apiClient);

        console.log('--- STEP 2: Sync Club Schedules ---');
        await syncClubSchedules(supabase, apiClient);

        console.log('--- STEP 3: Sync League Standings ---');
        const season = new Date().getFullYear().toString(); // Define season
        for (const leagueId of CORE_LEAGUES) {
            const leagueName = getLeagueName(leagueId);
            console.log(`   Processing ${leagueName} (${leagueId})...`);

            try {
                console.log(`      Fetching standings for season ${season}...`);
                await syncLeagueStandings(supabase, apiClient, leagueId, season); // Changed apiClient from client
                // Wait 2 seconds between requests to avoid 429s on V1 API
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`      ❌ Error syncing ${leagueName}:`, error);
            }
        }

        console.log('✅ [DAILY SYNC] Completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ [DAILY SYNC] Failed:', error);
        console.error(error);
        process.exit(1);
    }
}

main();
