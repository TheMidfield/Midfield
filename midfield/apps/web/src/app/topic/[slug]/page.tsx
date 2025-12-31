import { getTopicBySlug, getPlayersByClub, getPlayerClub, getClubsByLeague, getLeagueByTitle, getClubFixtures, getLeagueTable, getClubStanding, isContinentalLeague, getContinentalLeagueFixtures } from "@midfield/logic/src/topics";
import { ALLOWED_LEAGUES } from "@midfield/logic/src/constants";
import { notFound } from "next/navigation";
import { TopicPageClient } from "@/components/TopicPageClient";
import { getTakes } from "@/app/actions";
import { getUserProfile } from "@/app/profile/actions";

export default async function TopicPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const topic = await getTopicBySlug(slug);

    if (!topic) {
        return notFound();
    }

    // VISIBILITY CHECK (Top 5 Leagues Only)
    if (topic.type === 'club') {
        const league = (topic.metadata as any)?.league;
        if (!ALLOWED_LEAGUES.includes(league)) return notFound();
    } else if (topic.type === 'league') {
        const isContinental = isContinentalLeague(topic);
        const isAllowedNational = ALLOWED_LEAGUES.includes(topic.title);
        if (!isContinental && !isAllowedNational) return notFound();
    }

    const isClub = topic.type === 'club';
    const isPlayer = topic.type === 'player';
    const isLeague = topic.type === 'league';
    let squad: any[] = [];
    let groupedSquad: Record<string, any[]> = {};
    let playerClub: any = null;
    let leagueClubs: any[] = [];
    let fixtures: any[] = [];
    let standings: any[] = [];
    let clubStanding: any = null;

    let leagueSlug: string | undefined;

    if (isClub) {
        // Resolve valid league slug for navigation
        const leagueName = (topic.metadata as any)?.league;
        if (leagueName) {
            const leagueTopic = await getLeagueByTitle(leagueName);
            if (leagueTopic) leagueSlug = leagueTopic.slug;
        }

        squad = await getPlayersByClub(topic.id);

        // Group players by position
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

        // Fetch fixtures for club
        fixtures = await getClubFixtures(topic.id);

        // Fetch club standing
        clubStanding = await getClubStanding(topic.id);
    }

    if (isPlayer) {
        // Fetch the player's club
        playerClub = await getPlayerClub(topic.id);

        // VISIBILITY CHECK: Only show players from Allowed Clubs
        if (playerClub) {
            const leagueName = (playerClub.metadata as any)?.league;
            if (!ALLOWED_LEAGUES.includes(leagueName)) return notFound();

            // Resolve valid league slug
            if (leagueName) {
                const leagueTopic = await getLeagueByTitle(leagueName);
                if (leagueTopic) {
                    leagueSlug = leagueTopic.slug;

                    // For managers: fetch league standings
                    const position = (topic.metadata as any)?.position?.toLowerCase() || '';
                    if (position.includes('manager') || position.includes('coach')) {
                        fixtures = await getClubFixtures(playerClub.id);
                        clubStanding = await getClubStanding(playerClub.id);
                        standings = await getLeagueTable(leagueTopic.id);
                    }
                }
            }
        } else {
            // If player has NO club (e.g. Free Agent or data issue), hide them?
            // User said "only players from the 96 clubs".
            // So safe to hide.
            return notFound();
        }
    }

    if (isLeague) {
        // Check if this is a continental competition (Champions League, Europa League)
        const isContinental = isContinentalLeague(topic);

        if (isContinental) {
            // For continental leagues: fetch fixtures by competition_id
            // Do NOT fetch clubs (they belong to their national leagues)
            fixtures = await getContinentalLeagueFixtures(topic.id);
            leagueClubs = []; // No club list for continental competitions
            standings = []; // No standings table for continental competitions
        } else {
            // For national leagues: fetch clubs and standings as usual
            leagueClubs = await getClubsByLeague(topic.title);
            standings = await getLeagueTable(topic.id);
        }
    }

    // Fetch takes (posts) for this topic
    const posts = await getTakes(topic.id);

    // Fetch current user for composer avatar
    const userData = await getUserProfile();

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
        />
    );
}

