
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@midfield/types';
import { TheSportsDBClient } from './client';
import { smartUpsertTopic, syncPlayerForClub } from './smart-upsert';

// Helper to generate slug (duplicated from import script for now, should refine)
const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export async function processSyncJobs(
    supabase: SupabaseClient<Database>,
    apiClient: TheSportsDBClient,
    batchSize = 5
) {
    // 1. Fetch pending jobs
    // Note: For high concurrency we'd use RPC 'get_next_jobs', but for 1 worker/min this is fine.
    const { data: jobs, error } = await supabase
        .from('sync_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(batchSize);

    if (error || !jobs?.length) return { processed: 0 };

    // 2. Mark as processing
    const jobIds = jobs.map(j => j.id);
    await supabase.from('sync_jobs').update({ status: 'processing' }).in('id', jobIds);

    const results = [];

    // 3. Process each job
    for (const job of jobs) {
        try {
            if (job.job_type === 'sync_league') {
                // Expand League -> Club Jobs
                const { leagueId } = job.payload as any;
                const teams = await apiClient.listLeagueTeams(leagueId);

                const clubJobs = teams.map((t: any) => ({
                    job_type: 'sync_club',
                    payload: { teamStr: t.strTeam, teamId: t.idTeam, teamData: t }, // Pass small data, fetch details if needed
                    status: 'pending'
                }));

                if (clubJobs.length > 0) {
                    await supabase.from('sync_jobs').insert(clubJobs);
                }

            } else if (job.job_type === 'sync_club') {
                // Sync Club + Players
                const { teamId, teamData: t } = job.payload as any;

                // A. Upsert Club
                const clubSlug = slugify(t.strTeam);
                const clubTopic = {
                    slug: clubSlug,
                    type: 'club',
                    title: t.strTeam,
                    description: t.strDescriptionEN?.substring(0, 500) || `The official profile of ${t.strTeam}.`,
                    metadata: {
                        external: {
                            thesportsdb_id: t.idTeam,
                            source: 'thesportsdb'
                        },
                        badge_url: t.strBadge || t.strTeamBadge,
                        stadium: t.strStadium,
                        founded: t.intFormedYear ? parseInt(t.intFormedYear) : null,
                        league: t.strLeague,
                        capacity: t.intStadiumCapacity ? parseInt(t.intStadiumCapacity) : null,
                        socials: {
                            website: t.strWebsite,
                            twitter: t.strTwitter,
                            instagram: t.strInstagram,
                            facebook: t.strFacebook
                        }
                    },
                    is_active: true
                };
                const { data: club } = await smartUpsertTopic(supabase, clubTopic as any, 'club', t.idTeam);

                // B. Sync Players
                const players = await apiClient.listTeamPlayers(teamId);
                for (const p of players) {
                    if (!p.strPlayer) continue;

                    // Upsert Player
                    const playerTopic = {
                        slug: slugify(p.strPlayer),
                        type: 'player',
                        title: p.strPlayer,
                        description: p.strDescriptionEN?.substring(0, 300) || `Player for ${t.strTeam}.`,
                        metadata: {
                            external: {
                                thesportsdb_id: p.idPlayer,
                                source: 'thesportsdb'
                            },
                            photo_url: p.strCutout || p.strThumb,
                            position: p.strPosition,
                            nationality: p.strNationality,
                            birth_date: p.dateBorn,
                            height: p.strHeight,
                            weight: p.strWeight,
                            jersey_number: p.strNumber ? parseInt(p.strNumber) : null
                        },
                        is_active: true
                    };

                    const { data: player } = await smartUpsertTopic(supabase, playerTopic as any, 'player', p.idPlayer);

                    // Sync Relationship
                    if (club && player) {
                        await syncPlayerForClub(supabase, player.id, club.id);
                    }
                }
            }

            // Success
            await supabase.from('sync_jobs').update({ status: 'completed', processed_at: new Date().toISOString() }).eq('id', job.id);
            results.push({ id: job.id, status: 'success' });

        } catch (err: any) {
            // Failure
            console.error(`Job ${job.id} failed:`, err);
            await supabase.from('sync_jobs').update({
                status: 'failed',
                error_log: err.message,
                processed_at: new Date().toISOString()
            }).eq('id', job.id);
            results.push({ id: job.id, status: 'failed', error: err.message });
        }
    }

    return { processed: results.length, details: results };
}
