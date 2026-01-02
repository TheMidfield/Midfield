
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CORE_LEAGUES_TXT = [
    'English Premier League',
    'Spanish La Liga',
    'German Bundesliga',
    'Italian Serie A',
    'French Ligue 1',
    'UEFA Champions League',
    'UEFA Europa League'
];

// IDs we definitely want
const CORE_LEAGUE_IDS = ['4328', '4335', '4331', '4332', '4334', '4480', '4481'];

async function main() {
    console.log('--- AUDITING CORE CLUBS FILTER ---');

    const { data: allClubs } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'club')
        .not('metadata->external->>thesportsdb_id', 'is', null);

    if (!allClubs) return;

    const core = allClubs.filter(c => {
        const isStub = c.metadata?.is_stub === true;
        if (isStub) return false;

        // Check League Name
        const leagueName = c.metadata?.league || '';
        const nameMatch = CORE_LEAGUES_TXT.some(l => leagueName.includes(l));

        // Check League ID (if available somewhere, but usually in metadata for these old topics it's messy)
        // Let's rely on name matching for legacy topics largely, as TSDB format is consistent.
        // Or if we have `current_league_id`? 
        // Bayeux had "Coupe de France" as league. That is NOT in our CORE_LEAGUE_NAMES list.

        return nameMatch;
    });

    console.log(`Total Clubs: ${allClubs.length}`);
    console.log(`Filtered Core Clubs: ${core.length}`);

    console.log('\nSample Core:');
    core.slice(0, 5).forEach(c => console.log(`- ${c.title} (${c.metadata?.league})`));

    console.log('\nSample Rejected (Legacy but non-core):');
    const rejected = allClubs.filter(c => !c.metadata?.is_stub && !core.includes(c));
    rejected.slice(0, 5).forEach(c => console.log(`- ${c.title} (${c.metadata?.league})`));
}

main().catch(console.error);
