// Simplified livescores sync for Deno Edge Functions
// Focuses on core functionality: update scores for active matches
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { TheSportsDBClient } from './client.ts'

const LEAGUES = ['4328', '4335', '4332', '4331', '4334', '4480', '4481'];

export async function updateLivescores(supabase: SupabaseClient, apiClient: TheSportsDBClient) {
    const now = new Date();

    // Grim Reaper: Force-finish zombie matches (>2.5h old but still LIVE)
    const twoPointFiveHoursAgo = new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString();
    const { data: zombies } = await supabase
        .from('fixtures')
        .select('id, home_team_name, away_team_name')
        .in('status', ['LIVE', 'HT'])
        .lt('date', twoPointFiveHoursAgo);

    if (zombies && zombies.length > 0) {
        console.log(`[Grim Reaper] Killing ${zombies.length} zombie matches`);
        await supabase
            .from('fixtures')
            .update({ status: 'FT', updated_at: now.toISOString() })
            .in('id', zombies.map((z: any) => z.id));
    }

    // Reset future bogies (LIVE but >2.5h in future)
    const futureTwoPointFiveHours = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();
    const { data: bogies } = await supabase
        .from('fixtures')
        .select('id')
        .in('status', ['LIVE', 'HT'])
        .gt('date', futureTwoPointFiveHours);

    if (bogies && bogies.length > 0) {
        console.log(`[Grim Reaper] Resetting ${bogies.length} false-future-live matches`);
        await supabase
            .from('fixtures')
            .update({ status: 'NS', updated_at: now.toISOString() })
            .in('id', bogies.map((b: any) => b.id));
    }

    // Find active fixtures (12-hour window)
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
    const { data: activeFixtures } = await supabase
        .from('fixtures')
        .select('id, competition_id, status')
        .gte('date', twelveHoursAgo)
        .or('status.in.(LIVE,HT),status.eq.FT)');

    if (!activeFixtures || activeFixtures.length === 0) {
        console.log('No active fixtures. Skipping.');
        return;
    }

    const activeLeagues = new Set(activeFixtures.map(f => f.competition_id));

    // Resolve UUIDs to TSDB IDs
    const { data: leagueTopics } = await supabase
        .from('topics')
        .select('id, metadata')
        .in('id', Array.from(activeLeagues));

    const leagueIdMap = new Map<string, string>();
    if (leagueTopics) {
        leagueTopics.forEach((t: any) => {
            const externalId = t.metadata?.external?.thesportsdb_id;
            if (externalId) leagueIdMap.set(t.id, externalId);
        });
    }

    console.log(`Polling livescores for ${activeLeagues.size} leagues`);

    // Poll each active league
    for (const uuid of activeLeagues) {
        const tsdbId = leagueIdMap.get(uuid);
        if (!tsdbId) continue;

        try {
            const livescores = await apiClient.getLivescores(tsdbId);
            const events = livescores.events || [];

            if (events.length === 0) continue;

            // Update each event
            for (const event of events) {
                const { data: existing } = await supabase
                    .from('fixtures')
                    .select('id')
                    .eq('external_id', event.idEvent)
                    .maybeSingle();

                if (!existing) continue;

                await supabase.from('fixtures').update({
                    status: mapStatus(event.strStatus),
                    home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
                    away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
                    minute: event.strProgress || null,
                    updated_at: now.toISOString()
                }).eq('id', existing.id);
            }

            console.log(`Updated ${events.length} fixtures for league ${tsdbId}`);
        } catch (err) {
            console.error(`Failed to sync league ${tsdbId}:`, err);
        }
    }
}

function mapStatus(apiStatus: string): string {
    const statusMap: Record<string, string> = {
        'Not Started': 'NS',
        'Match Finished': 'FT',
        'Half Time': 'HT',
        'First Half': '1H',
        'Second Half': '2H',
        'Extra Time': 'ET',
        'Penalties': 'PEN',
        'Postponed': 'PST',
        'Abandoned': 'ABD'
    };
    return statusMap[apiStatus] || 'LIVE';
}
