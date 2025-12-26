
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@midfield/types';

// Target Leagues (could be moved to DB later)
const TARGET_LEAGUES = [
    { id: '4328', name: 'English Premier League' },
    { id: '4335', name: 'Spanish La Liga' },
    { id: '4332', name: 'Italian Serie A' },
    { id: '4331', name: 'German Bundesliga' },
    { id: '4334', name: 'French Ligue 1' },
];

export async function scheduleDailySync(supabase: SupabaseClient<Database>) {
    const jobs = TARGET_LEAGUES.map(league => ({
        job_type: 'sync_league',
        payload: { leagueId: league.id, name: league.name },
        status: 'pending'
    }));

    const { error } = await supabase
        .from('sync_jobs')
        .insert(jobs);

    if (error) throw error;

    return { queued: jobs.length };
}
