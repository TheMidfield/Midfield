
import { createClient } from "@/lib/supabase/server";
import { TheSportsDBClient } from "@midfield/logic/src/sync/client";
import { updateLivescores } from "@midfield/logic/src/sync/simple-fixture-sync";

// Secure cron endpoint
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabase = await createClient();
        const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY!);

        // This function handles its own "should I run?" logic
        await updateLivescores(supabase, apiClient);

        return Response.json({ success: true, message: 'Livescore check completed' });
    } catch (error) {
        console.error('Livescore sync failed:', error);
        return Response.json({ success: false, error: 'Sync failed' }, { status: 500 });
    }
}
