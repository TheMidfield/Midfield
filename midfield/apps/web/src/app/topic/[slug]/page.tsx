import { getTopicBySlug, getPlayersByClub, getPlayerClub, getClubsByLeague, getLeagueByTitle, getClubFixtures, getLeagueTable, getClubStanding, isContinentalLeague, getContinentalLeagueFixtures } from "@midfield/logic/src/topics";
import { ALLOWED_LEAGUES } from "@midfield/logic/src/constants";
import { notFound } from "next/navigation";
import { TopicPageClient } from "@/components/TopicPageClient";
import { getTakes } from "@/app/actions";
import { getUserProfile } from "@/app/profile/actions";
import { getTopicVotes } from "@/app/actions/vote-topic";
import { cache } from "react";

// Cached wrappers for request-level deduplication
const cachedGetTopicBySlug = cache(getTopicBySlug);
const cachedGetPlayersByClub = cache(getPlayersByClub);
const cachedGetPlayerClub = cache(getPlayerClub);
const cachedGetClubsByLeague = cache(getClubsByLeague);
const cachedGetLeagueByTitle = cache(getLeagueByTitle);
const cachedGetClubFixtures = cache(getClubFixtures);
const cachedGetLeagueTable = cache(getLeagueTable);
const cachedGetClubStanding = cache(getClubStanding);
const cachedGetContinentalLeagueFixtures = cache(getContinentalLeagueFixtures);

export default async function TopicPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const topic = await cachedGetTopicBySlug(slug);

    if (!topic) {
        return notFound();
    }

    // VISIBILITY CHECK (Top 5 Leagues Only)
    // Safe to cast metadata as any since we generated it
    const metadata = topic.metadata as any;

    if (topic.type === 'club') {
        const league = metadata?.league;
        if (!ALLOWED_LEAGUES.includes(league)) return notFound();
    } else if (topic.type === 'league') {
        const isContinental = isContinentalLeague(topic);
        const isAllowedNational = ALLOWED_LEAGUES.includes(topic.title);
        if (!isContinental && !isAllowedNational) return notFound();
    }

    const { type, id, title } = topic;

    // Initialize empty state
    let squad: any[] = [];
    let groupedSquad: Record<string, any[]> = {};
    let playerClub: any = null;
    let leagueClubs: any[] = [];
    let fixtures: any[] = [];
    let standings: any[] = [];
    let clubStanding: any = null;
    let leagueSlug: string | undefined;

    // Parallel Fetching Promises
    const parallelFetches: Promise<void>[] = [];

    // 1. Fetches for CLUBS
    if (type === 'club') {
        // A. League Slug (for nav)
        const leagueName = metadata?.league;
        if (leagueName) {
            parallelFetches.push((async () => {
                const leagueTopic = await cachedGetLeagueByTitle(leagueName);
                if (leagueTopic) leagueSlug = leagueTopic.slug;
            })());
        }

        // B. Squad & Grouping
        parallelFetches.push((async () => {
            squad = await cachedGetPlayersByClub(id);
            groupedSquad = squad.reduce((acc, player) => {
                let pos = (player.metadata as any)?.position || "Other";
                const normalized = pos.toLowerCase();

                if (normalized.includes("manager") || normalized.includes("coach")) pos = "Staff";
                else if (normalized.includes("goalkeeper")) pos = "Goalkeepers";
                else if (normalized.includes("back") || normalized.includes("defender")) pos = "Defenders";
                else if (normalized.includes("midfield")) pos = "Midfielders";
                else if (normalized.includes("forward") || normalized.includes("wing") || normalized.includes("striker")) pos = "Forwards";
                else pos = "Other";

                if (!acc[pos]) acc[pos] = [];
                acc[pos].push(player);
                return acc;
            }, {} as Record<string, any[]>);
        })());

        // C. Fixtures
        parallelFetches.push((async () => {
            fixtures = await cachedGetClubFixtures(id);
        })());

        // D. Standing
        parallelFetches.push((async () => {
            clubStanding = await cachedGetClubStanding(id);
        })());
    }

    // 2. Fetches for PLAYERS
    if (type === 'player') {
        parallelFetches.push((async () => {
            // Must fetch club first to know context
            const pClub = await cachedGetPlayerClub(id);
            playerClub = pClub;

            if (!pClub) {
                // Logic handled after await
                return;
            }

            const leagueName = (pClub.metadata as any)?.league;
            if (ALLOWED_LEAGUES.includes(leagueName)) {
                // League Slug
                const leagueTopic = await cachedGetLeagueByTitle(leagueName);
                if (leagueTopic) leagueSlug = leagueTopic.slug;

                // Manager special case
                const position = metadata?.position?.toLowerCase() || '';
                if (position.includes('manager') || position.includes('coach')) {
                    // Parallel sub-fetches for manager
                    const managerPromises = [
                        cachedGetClubFixtures(pClub.id).then(res => { fixtures = res; }),
                        cachedGetClubStanding(pClub.id).then(res => { clubStanding = res; }),
                        (leagueTopic ? cachedGetLeagueTable(leagueTopic.id).then(res => { standings = res; }) : Promise.resolve())
                    ];
                    await Promise.all(managerPromises);
                }
            }
        })());
    }

    // 3. Fetches for LEAGUES
    if (type === 'league') {
        parallelFetches.push((async () => {
            const isContinental = isContinentalLeague(topic);
            if (isContinental) {
                fixtures = await cachedGetContinentalLeagueFixtures(id);
            } else {
                const [clubsRes, tableRes] = await Promise.all([
                    cachedGetClubsByLeague(title),
                    cachedGetLeagueTable(id)
                ]);
                leagueClubs = clubsRes;
                standings = tableRes;
            }
        })());
    }

    // 4. Common fetches (Takes, User Profile)
    // We can also parallelize these!
    let posts: any[] = [];
    let userData: any = null;
    let voteData: any = null;

    parallelFetches.push((async () => {
        posts = await getTakes(id);
    })());

    parallelFetches.push((async () => {
        userData = await getUserProfile();
    })());

    parallelFetches.push((async () => {
        voteData = await getTopicVotes(id);
    })());

    // EXECUTE ALL FETCHES
    await Promise.all(parallelFetches);

    // Post-fetch Checks
    if (type === 'player' && !playerClub) {
        // As per original logic: hide player if no club found (or not in allowed leagues, checked inside)
        // Check "only show players from Allowed Clubs"
        return notFound();
    }

    // Check player allowed league AFTER fetch (since we need playerClub to know)
    if (type === 'player' && playerClub) {
        const leagueName = (playerClub.metadata as any)?.league;
        if (!ALLOWED_LEAGUES.includes(leagueName)) return notFound();
    }

    return (
        <TopicPageClient
            topic={topic}
            squad={squad}
            groupedSquad={groupedSquad}
            playerClub={playerClub}
            leagueClubs={leagueClubs}
            fixtures={fixtures}
            standings={standings}
            clubStanding={clubStanding}
            posts={posts}
            currentUser={{
                id: userData?.user?.id,
                avatar_url: userData?.profile?.avatar_url || null,
                username: userData?.profile?.username || null,
            }}
            leagueSlug={leagueSlug}
            voteData={voteData}
        />
    );
}
