
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
                    // Update: Handle National vs Continental
                    const { leagueId, leagueType } = job.payload;
                    // Fallback detection if type not present
                    const isContinental = leagueType === 'continental' || ['4480', '4481', '4482', '4483', '4484', '4485', '4506', '4511', '4570', '4571'].includes(leagueId);

                    if (isContinental) {
                        // Continental: Just upsert the league topic itself (metadata, badge) and STOP.
                        // Do NOT expand to clubs because continental clubs belong to their national leagues.
                        const details = await apiClient.getLeagueDetails(leagueId);
                        if (details) {
                            const leagueTopic = {
                                type: 'league',
                                title: details.strLeague,
                                slug: slugify(details.strLeague),
                                description: details.strDescriptionEN?.substring(0, 500) || `Overview of ${details.strLeague}.`,
                                metadata: {
                                    external: { thesportsdb_id: leagueId, source: 'thesportsdb' },
                                    logo_url: details.strLogo,
                                    logo_url_dark: details.strLogo,
                                    badge_url: details.strBadge,
                                    trophy_url: details.strTrophy,
                                    poster_url: details.strPoster,
                                    country: details.strCountry,
                                    founded: details.intFormedYear ? parseInt(details.intFormedYear) : null,
                                    website: details.strWebsite,
                                    competition_type: 'continental',
                                    region: 'Europe' // defaulting to Europe for now
                                },
                                is_active: true
                            };
                            // Upsert without expanding clubs
                            await smartUpsertTopic(supabase, leagueTopic, 'league', leagueId);
                        } else {
                            console.warn(`Could not fetch details for continental league ${leagueId}`);
                        }
                    } else {
                        // National League: Expand League -> Club Jobs + Fixtures + Standings
                        // 1. Fetch Clubs
                        const teams = await apiClient.listLeagueTeams(leagueId);

                        const clubJobs = teams.map((t: any) => ({
                            job_type: 'sync_club',
                            payload: { teamStr: t.strTeam, teamId: t.idTeam, teamData: t },
                            status: 'pending'
                        }));

                        if (clubJobs.length > 0) {
                            clubJobs.push({
                                job_type: 'sync_standings',
                                payload: { leagueId, season: '2024-2025' },
                                status: 'pending'
                            } as any);

                            await supabase.from('sync_jobs').insert(clubJobs);
                        }
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
                                jersey_number: p.strNumber ? parseInt(p.strNumber) : null,
                                // Contracts (Best Effort)
                                wage: p.strWage || null,
                                signed_date: p.dateSigned || null
                            },
                            is_active: true
                        };

                        const { data: player } = await smartUpsertTopic(supabase, playerTopic, 'player', p.idPlayer);

                        // Try fetching Contracts (API v2) - Low priority, often empty
                        try {
                            const contractData = await apiClient.getPlayerContracts(p.idPlayer);
                            if (contractData && contractData.length > 0) {
                                // Update metadata with more contract info if available
                                const contract = contractData[0];
                                if (contract.strWage) {
                                    await supabase.from('topics').update({
                                        metadata: { ...playerTopic.metadata, wage: contract.strWage, contract_expiry: contract.strSigning }
                                    }).eq('id', player.id);
                                }
                            }
                        } catch (e) {
                            // Ignore contract errors
                        }

                        if (club && player) {
                            await syncPlayerForClub(supabase, player.id, club.id);
                        }
                    }

                } else if (job.job_type === 'sync_fixtures') {
                    // DISABLED: Realtime Engine (V2) now handles fixtures
                    // Just mark as completed to clean queue
                    results.push({ id: job.id, status: 'skipped' });

                } else if (job.job_type === 'sync_standings') {
                    // Sync League Table
                    const { leagueId, season } = job.payload;
                    const table = await apiClient.getLeagueTable(leagueId, season || '2024-2025');

                    if (table.length > 0) {
                        // Resolve League Topic ID
                        const { data: leagueTopic } = await supabase.from('topics').select('id').eq('type', 'league').contains('metadata', { external: { thesportsdb_id: leagueId } }).single();

                        if (leagueTopic) {
                            // Clear old standings for this league to avoid ghosts
                            // Or just upsert? Rank changes means checking unique constraint.
                            // Best to delete all for this league and re-insert?
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
                    const { playerId, thesportsdbId } = job.payload;

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
                                        ...existingTopic.metadata,
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
