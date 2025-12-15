import { getTopicBySlug, getPlayersByClub, getPlayerClub } from "@midfield/logic/src/topics";
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
    let squad: any[] = [];
    let groupedSquad: Record<string, any[]> = {};
    let playerClub: any = null;

    if (isClub) {
        squad = await getPlayersByClub(topic.id);

        // Group players by position
        groupedSquad = squad.reduce((acc, player) => {
            let pos = player.metadata?.position || "Other";
            if (pos.includes("Goalkeeper")) pos = "Goalkeepers";
            else if (pos.includes("Back") || pos.includes("Defender")) pos = "Defenders";
            else if (pos.includes("Midfield")) pos = "Midfielders";
            else if (pos.includes("Forward") || pos.includes("Wing") || pos.includes("Striker")) pos = "Forwards";

            if (!acc[pos]) acc[pos] = [];
            acc[pos].push(player);
            return acc;
        }, {} as Record<string, any[]>);
    }

    if (isPlayer) {
        // Fetch the player's club
        playerClub = await getPlayerClub(topic.id);
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
            posts={posts}
            currentUser={{
                avatar_url: userData?.profile?.avatar_url || null,
                username: userData?.profile?.username || null,
            }
            }
        />
    );
}
