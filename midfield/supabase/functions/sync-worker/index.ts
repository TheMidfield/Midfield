
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
                    // Expand League -> Club Jobs + Fixtures + Standings
                    const { leagueId } = job.payload;
                    const teams = await apiClient.listLeagueTeams(leagueId);

                    const clubJobs = teams.map((t: any) => ({
                        job_type: 'sync_club',
                        payload: { teamStr: t.strTeam, teamId: t.idTeam, teamData: t },
                        status: 'pending'
                    }));

                    if (clubJobs.length > 0) {
                        // Add Auxiliary Jobs (League Level)
                        clubJobs.push({
                            job_type: 'sync_fixtures',
                            payload: { leagueId, season: '2024-2025' },
                            status: 'pending'
                        } as any);

                        clubJobs.push({
                            job_type: 'sync_standings',
                            payload: { leagueId, season: '2024-2025' },
                            status: 'pending'
                        } as any);

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
                    // Sync Fixtures (League Level) - Next 15 & Prev 15
                    const { leagueId } = job.payload;
                    const { data: leagueTopic } = await supabase.from('topics').select('id').eq('type', 'league').contains('metadata', { external: { thesportsdb_id: leagueId } }).single();

                    if (leagueTopic) {
                        const [next, prev] = await Promise.all([
                            apiClient.getLeagueNextFixtures(leagueId),
                            apiClient.getLeagueLastFixtures(leagueId)
                        ]);

                        const allFixtures = [...next, ...prev];
                        // Cache club lookups to avoid N+1 DB calls
                        const clubCache = new Map<string, string>(); // TSDB_ID -> UUID

                        for (const f of allFixtures) {
                            if (!f.idHomeTeam || !f.idAwayTeam) continue;

                            let homeId = clubCache.get(f.idHomeTeam);
                            if (!homeId) {
                                const { data: h } = await supabase.from('topics').select('id').eq('type', 'club').contains('metadata', { external: { thesportsdb_id: f.idHomeTeam } }).single();
                                if (h) { homeId = h.id; clubCache.set(f.idHomeTeam, h.id); }
                            }

                            let awayId = clubCache.get(f.idAwayTeam);
                            if (!awayId) {
                                const { data: a } = await supabase.from('topics').select('id').eq('type', 'club').contains('metadata', { external: { thesportsdb_id: f.idAwayTeam } }).single();
                                if (a) { awayId = a.id; clubCache.set(f.idAwayTeam, a.id); }
                            }

                            if (homeId && awayId) {
                                const fixturePayload = {
                                    id: parseInt(f.idEvent),
                                    home_team_id: homeId,
                                    away_team_id: awayId,
                                    competition_id: leagueTopic.id,
                                    date: f.dateEvent + (f.strTime ? 'T' + f.strTime : ''),
                                    status: f.strStatus === 'Match Finished' ? 'FT' : 'Not Started',
                                    home_score: f.intHomeScore ? parseInt(f.intHomeScore) : null,
                                    away_score: f.intAwayScore ? parseInt(f.intAwayScore) : null,
                                    venue: f.strVenue,
                                    gameweek: f.intRound ? parseInt(f.intRound) : null
                                };
                                await supabase.from('fixtures').upsert(fixturePayload);
                            }
                        }
                    }

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
                                        rank: parseInt(row.intRank),
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
