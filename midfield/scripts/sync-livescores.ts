#!/usr/bin/env tsx
/**
 * Livescores Sync Script
 * Runs every 5 minutes via GitHub Actions
 * Replaces /api/cron/livescores (Vercel)
 */

import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '@midfield/logic/src/sync/client';
import { updateLivescores } from '@midfield/logic/src/sync/simple-fixture-sync';
import { config } from 'dotenv';

config();

async function main() {
    console.log('🔴 [LIVESCORE SYNC] Starting...');
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

        await updateLivescores(supabase, apiClient);

        console.log('✅ [LIVESCORE SYNC] Completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ [LIVESCORE SYNC] Failed:', error);
        console.error(error);
        process.exit(1);
    }
}

main();
