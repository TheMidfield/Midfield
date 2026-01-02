
import { createClient } from "@/lib/supabase/server";
import { TheSportsDBClient } from "@midfield/logic/src/sync/client";
import { syncDailySchedules } from "@midfield/logic/src/sync/simple-fixture-sync";

// Secure cron endpoint - accepts CRON_SECRET or Supabase service role key
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Accept either CRON_SECRET or Supabase service role key
    const isValidCronSecret = token === process.env.CRON_SECRET;
    const isValidServiceRole = token === process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!isValidCronSecret && !isValidServiceRole) {
        return new Response('Unauthorized', { status: 401 });
    }


    try {
        const supabase = await createClient();
        const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!);

        await syncDailySchedules(supabase, apiClient);

        // Secondary Sync: Ensure 96 Club Calendars are perfect (covers FA Cup, etc.)
        const { syncClubSchedules } = await import("@midfield/logic/src/sync/simple-fixture-sync");
        await syncClubSchedules(supabase, apiClient);

        return Response.json({ success: true, message: 'Daily schedule & Club sync completed' });
    } catch (error) {
        console.error('Daily sync failed:', error);
        return Response.json({ success: false, error: 'Sync failed' }, { status: 500 });
    }
}
