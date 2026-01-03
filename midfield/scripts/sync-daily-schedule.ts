#!/usr/bin/env tsx
/**
 * Daily Schedule & Standings Sync Script
 * Runs every 6 hours via GitHub Actions
 * Replaces /api/cron/daily-schedule (Vercel)
 */

import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '@midfield/logic/src/sync/client';
import {
    syncDailySchedules,
    syncClubSchedules,
    syncLeagueStandings
} from '@midfield/logic/src/sync/simple-fixture-sync';
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
        await syncLeagueStandings(supabase, apiClient);

        console.log('✅ [DAILY SYNC] Completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ [DAILY SYNC] Failed:', error);
        console.error(error);
        process.exit(1);
    }
}

main();
