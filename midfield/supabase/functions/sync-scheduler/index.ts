
import { createClient } from 'jsr:@supabase/supabase-js@2';

const LEAGUES = [
    { id: '4328', name: 'English Premier League', type: 'national' },
    { id: '4335', name: 'Spanish La Liga', type: 'national' },
    { id: '4332', name: 'Italian Serie A', type: 'national' },
    { id: '4331', name: 'German Bundesliga', type: 'national' },
    { id: '4334', name: 'French Ligue 1', type: 'national' },
    { id: '4480', name: 'UEFA Champions League', type: 'continental' },
    { id: '4481', name: 'UEFA Europa League', type: 'continental' }
];

Deno.serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        // Initialize Supabase Client
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('⏰ Sync Scheduler running...');

        // 0. Cleanup Stale Jobs ("Zombie Reset")
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { error: cleanupError } = await supabase
            .from('sync_jobs')
            .update({ status: 'pending', error_log: 'Zombie reset by scheduler' })
            .eq('status', 'processing')
            .lt('processed_at', oneHourAgo);

        if (cleanupError) {
            console.error('⚠️ Cleanup warning:', cleanupError);
        } else {
            console.log('🧹 Cleanup: Checked for stale jobs.');
        }

        // 1. Create jobs payload
        const jobs = LEAGUES.map(league => ({
            job_type: 'sync_league',
            payload: { leagueId: league.id, leagueName: league.name, leagueType: league.type },
            status: 'pending',
            created_at: new Date().toISOString() // explicit timestamp often helps
        }));

        // 2. Insert jobs
        // We do a simple insert. The worker will pick them up.
        // If we wanted to be fancy, we could check for duplicates, but for now, 
        // the daily cron ensures this only happens once a day.
        const { data, error } = await supabase
            .from('sync_jobs')
            .insert(jobs)
            .select();

        if (error) {
            console.error('❌ Failed to enqueue jobs:', error);
            throw error;
        }

        console.log(`✅ Enqueued ${jobs.length} league sync jobs.`);

        return new Response(
            JSON.stringify({
                success: true,
                message: `Enqueued ${jobs.length} jobs`,
                jobs: data
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            }
        );
    }
});
