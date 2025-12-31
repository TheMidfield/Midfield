
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
                // Extract league info
                const { leagueId, name, type } = job.payload as any;

                // Robust check: Trust payload type, but fallback to ID list
                const isContinental = type === 'continental' || ['4480', '4481'].includes(leagueId);

                // For continental leagues, ONLY create the league topic
                // Do NOT expand to clubs (clubs belong to their national leagues)
                if (isContinental) {
                    // Fetch league details from API
                    const leagueDetails = await apiClient.getLeagueDetails(leagueId);

                    // Upsert league topic only
                    const leagueTopic = {
                        slug: slugify(name),
                        type: 'league',
                        title: name,
                        description: leagueDetails?.strDescriptionEN?.substring(0, 500) || `The official profile of ${name}.`,
                        metadata: {
                            competition_type: 'continental',
                            region: 'Europe',
                            badge_url: leagueDetails?.strBadge,
                            thesportsdb_id: leagueId,
                        },
                        is_active: true
                    };
                    await smartUpsertTopic(supabase, leagueTopic as any, 'league', leagueId);



                } else {
                    // For national leagues: expand to club sync jobs as usual
                    const teams = await apiClient.listLeagueTeams(leagueId);

                    const clubJobs = teams.map((t: any) => ({
                        job_type: 'sync_club',
                        payload: { teamStr: t.strTeam, teamId: t.idTeam, teamData: t },
                        status: 'pending'
                    }));

                    if (clubJobs.length > 0) {
                        // Also sync standings for national leagues
                        clubJobs.push({
                            job_type: 'sync_standings',
                            payload: { leagueId, season: '2024-2025' },
                            status: 'pending'
                        } as any);

                        await supabase.from('sync_jobs').insert(clubJobs);
                    }
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
                        founded: t.intFormedYear ? parseInt(String(t.intFormedYear)) : null,
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
            } else if (job.job_type === 'sync_standings') {
                // Sync League Table
                const { leagueId, season } = job.payload as any;
                const table = await apiClient.getLeagueTable(leagueId, season || '2024-2025');

                if (table && table.length > 0) {
                    // Resolve League Topic ID
                    const { data: leagueTopic } = await supabase.from('topics').select('id').eq('type', 'league').contains('metadata', { external: { thesportsdb_id: leagueId } }).single();

                    if (leagueTopic) {
                        // Clear old standings for this league
                        await supabase.from('league_standings').delete().eq('league_id', leagueTopic.id);

                        const standingsPayloads = [];
                        for (const row of table) {
                            const { data: teamTopic } = await supabase.from('topics').select('id').eq('type', 'club').contains('metadata', { external: { thesportsdb_id: row.idTeam } }).single();
                            if (teamTopic) {
                                standingsPayloads.push({
                                    league_id: leagueTopic.id,
                                    team_id: teamTopic.id,
                                    position: parseInt(row.intRank),
                                    points: parseInt(row.intPoints),
                                    played: parseInt(row.intPlayed),
                                    goals_diff: parseInt(row.intGoalDifference),
                                    goals_for: parseInt(row.intGoalsFor),
                                    goals_against: parseInt(row.intGoalsAgainst),
                                    form: row.strForm,
                                    description: row.strDescription
                                });
                            }
                        }

                        if (standingsPayloads.length > 0) {
                            await supabase.from('league_standings').insert(standingsPayloads);
                        }
                    }
                }
            } else if (job.job_type === 'enrich_player') {
                // Enrich Player Metadata from V1 API
                const { playerId, thesportsdbId } = job.payload as any;

                const playerDetails = await apiClient.lookupPlayer(thesportsdbId);
                if (playerDetails) {
                    // Update only the missing fields
                    const enrichedMetadata = {
                        height: playerDetails.strHeight || null,
                        weight: playerDetails.strWeight || null,
                        nationality: playerDetails.strNationality || null,
                        jersey_number: playerDetails.strNumber ? parseInt(playerDetails.strNumber) : null,
                    };

                    // Fetch existing metadata first
                    const { data: existingTopic } = await supabase
                        .from('topics')
                        .select('metadata')
                        .eq('id', playerId)
                        .single();

                    if (existingTopic) {
                        await supabase
                            .from('topics')
                            .update({
                                metadata: {
                                    ...(existingTopic.metadata as object),
                                    ...enrichedMetadata
                                }
                            })
                            .eq('id', playerId);
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
