import { getTopicBySlug, getPlayersByClub, getPlayerClub, getClubsByLeague, getClubFixtures, getLeagueTable, getClubStanding } from "@midfield/logic/src/topics";
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

    if (isClub) {
        squad = await getPlayersByClub(topic.id);

        // Group players by position
        groupedSquad = squad.reduce((acc, player) => {
            let pos = player.metadata?.position || "Other";
            const normalized = pos.toLowerCase();

            if (normalized.includes("manager") || normalized.includes("coach")) pos = "Manager";
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
    }

    if (isLeague) {
        // Fetch clubs belonging to this league
        leagueClubs = await getClubsByLeague(topic.title);

        // Fetch standings for league
        standings = await getLeagueTable(topic.id);
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
            }
            }
        />
    );
}

