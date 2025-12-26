
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { TheSportsDBClient } from '../_shared/client.ts';
import { smartUpsertTopic, syncPlayerForClub, slugify } from '../_shared/smart-upsert.ts';

Deno.serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const apiKey = Deno.env.get('THESPORTSDB_API_KEY') ?? '';

        if (!apiKey) throw new Error('Missing API Key');

        const supabase = createClient(supabaseUrl, supabaseKey);
        const apiClient = new TheSportsDBClient(apiKey);
        const BATCH_SIZE = 5;

        // 1. Fetch pending jobs
        const { data: jobs, error } = await supabase
            .from('sync_jobs')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(BATCH_SIZE);

        if (error) throw error;
        if (!jobs || jobs.length === 0) {
            return new Response(JSON.stringify({ processed: 0 }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Mark as processing
        // 2. Mark as processing (using processed_at as "started_at" for stuck job detection)
        const jobIds = jobs.map(j => j.id);
        const processingPayload = {
            status: 'processing',
            processed_at: new Date().toISOString()
        };
        await supabase.from('sync_jobs').update(processingPayload).in('id', jobIds);

        const results = [];

        // 3. Process each job
        for (const job of jobs) {
            try {
                if (job.job_type === 'sync_league') {
                    // Expand League -> Club Jobs
                    const { leagueId } = job.payload;
                    const teams = await apiClient.listLeagueTeams(leagueId);

                    const clubJobs = teams.map((t: any) => ({
                        job_type: 'sync_club',
                        payload: { teamStr: t.strTeam, teamId: t.idTeam, teamData: t },
                        status: 'pending'
                    }));

                    if (clubJobs.length > 0) {
                        await supabase.from('sync_jobs').insert(clubJobs);
                    }

                } else if (job.job_type === 'sync_club') {
                    const { teamId, teamData: t } = job.payload;

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
                    const { data: club } = await smartUpsertTopic(supabase, clubTopic, 'club', t.idTeam);

                    // B. Sync Players
                    const players = await apiClient.listTeamPlayers(teamId);
                    for (const p of players) {
                        if (!p.strPlayer) continue;

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

                        const { data: player } = await smartUpsertTopic(supabase, playerTopic, 'player', p.idPlayer);

                        if (club && player) {
                            await syncPlayerForClub(supabase, player.id, club.id);
                        }
                    }
                }

                // Success
                await supabase.from('sync_jobs').update({ status: 'completed', processed_at: new Date().toISOString() }).eq('id', job.id);
                results.push({ id: job.id, status: 'success' });

            } catch (err) {
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

        return new Response(JSON.stringify({ processed: results.length, details: results }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
});
