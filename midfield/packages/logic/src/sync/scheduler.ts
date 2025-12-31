
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@midfield/types';

// Target Leagues (could be moved to DB later)
const TARGET_LEAGUES = [
    // National Leagues
    { id: '4328', name: 'English Premier League', type: 'national' },
    { id: '4335', name: 'Spanish La Liga', type: 'national' },
    { id: '4332', name: 'Italian Serie A', type: 'national' },
    { id: '4331', name: 'German Bundesliga', type: 'national' },
    { id: '4334', name: 'French Ligue 1', type: 'national' },
    // Continental Competitions (no club sync - clubs belong to national leagues)
    { id: '4480', name: 'UEFA Champions League', type: 'continental' },
    { id: '4481', name: 'UEFA Europa League', type: 'continental' },
];

export async function scheduleDailySync(supabase: SupabaseClient<Database>) {
    const jobs = TARGET_LEAGUES.map(league => ({
        job_type: 'sync_league',
        payload: { leagueId: league.id, name: league.name, type: league.type },
        status: 'pending'
    }));

    const { error } = await supabase
        .from('sync_jobs')
        .insert(jobs);

    if (error) throw error;

    return { queued: jobs.length };
}
