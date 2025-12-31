
import { supabase } from '../packages/logic/src/supabase';

async function listLeagues() {
    const { data: clubs, error } = await supabase
        .from('topics')
        .select('metadata')
        .eq('type', 'club');

    if (error) {
        console.error(error);
        return;
    }

    const leagueCounts: Record<string, number> = {};
    clubs.forEach(c => {
        const league = c.metadata?.league || "Unknown";
        leagueCounts[league] = (leagueCounts[league] || 0) + 1;
    });

    console.log("Club Counts by League:");
    console.table(leagueCounts);
}

listLeagues();
