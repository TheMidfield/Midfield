import { createClient } from "@supabase/supabase-js";
import { TheSportsDBClient } from "@midfield/logic/src/sync/client";
import { syncDailySchedules, syncClubSchedules, syncLeagueStandings } from "@midfield/logic/src/sync/simple-fixture-sync";
import { NextResponse } from "next/server"; // Assuming NextResponse is needed based on the new code's return types

// Allow this to run for up to 5 minutes (Vercel Pro/Enterprise default is 10s/60s, explicit config helps)
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const hasValidAuth = authHeader === `Bearer ${process.env.CRON_SECRET}` ||
            authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

        if (!hasValidAuth) {
            return new Response('Unauthorized', { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!); // Re-added API key based on original code

        console.log('--- CRON START: Daily Schedule Sync ---');

        // 1. Sync League Schedules (EPL, La Liga, etc.)
        await syncDailySchedules(supabase, apiClient);

        // 2. Sync Club-Specific Schedules (FA Cup, etc. for 96 Core Clubs)
        await syncClubSchedules(supabase, apiClient);

        // 3. Sync League Standings (Tables)
        await syncLeagueStandings(supabase, apiClient);

        console.log('--- CRON END: Daily Schedule Sync ---');

        return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Cron failed:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
