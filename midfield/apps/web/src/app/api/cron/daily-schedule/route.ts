
import { createClient } from "@/lib/supabase/server";
import { TheSportsDBClient } from "@midfield/logic/src/sync/client";
import { syncDailySchedules } from "@midfield/logic/src/sync/simple-fixture-sync";

// Secure cron endpoint - check for secret if needed (Vercel uses CRON_SECRET)
export async function GET(request: Request) {
    // Optional: Check for Vercel Cron header
    /*
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    */

    try {
        const supabase = await createClient();
        const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!);

        await syncDailySchedules(supabase, apiClient);

        return Response.json({ success: true, message: 'Daily schedule sync completed' });
    } catch (error) {
        console.error('Daily sync failed:', error);
        return Response.json({ success: false, error: 'Sync failed' }, { status: 500 });
    }
}
