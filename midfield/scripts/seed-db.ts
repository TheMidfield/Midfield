import fs from 'fs';
import path from 'path';

const CLUBS = [
    "Arsenal",
    "Real Madrid",
    "Manchester City"
];

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";

interface Topic {
    id: string;
    slug: string;
    title: string;
    type: 'club' | 'player';
    description: string;
    metadata: any;
    isTrending?: boolean;
}

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

async function fetchData() {
    const topics: Topic[] = [];

    console.log("🚀 Starting data seed for:", CLUBS.join(", "));

    for (const clubName of CLUBS) {
        console.log(`\n🔵 Processing: ${clubName}...`);

        // 1. Fetch Club Details
        const teamUrl = `${API_BASE}/searchteams.php?t=${encodeURIComponent(clubName)}`;
        const teamRes = await fetch(teamUrl);
        const teamData = await teamRes.json();

        // FIND THE SOCCER TEAM explicitly
        const team = teamData.teams?.find((t: any) => t.strSport === "Soccer");

        if (!team) {
            console.error(`❌ Soccer Team not found: ${clubName}`);
            continue;
        }

        const clubSlug = slugify(team.strTeam);
        const clubId = `club_${team.idTeam}`;

        // Map Club Topic (EXCLUDING BANNER per user request)
        const clubTopic: Topic = {
            id: clubId,
            slug: clubSlug,
            title: team.strTeam,
            type: 'club',
            description: team.strDescriptionEN || `The official profile of ${team.strTeam}.`,
            metadata: {
                badge_url: team.strBadge,
                stadium: team.strStadium,
                formed_year: team.intFormedYear,
                socials: {
                    website: team.strWebsite,
                    twitter: team.strTwitter,
                    instagram: team.strInstagram
                },
                leagues: [team.strLeague, team.strLeague2, team.strLeague3].filter(Boolean)
            },
            isTrending: true // Default clubs to trending
        };

        topics.push(clubTopic);
        console.log(`   ✅ Added Club: ${team.strTeam}`);

        // 2. Fetch Players using lookup_all_players (searchplayers is broken on free tier)
        const playersUrl = `${API_BASE}/lookup_all_players.php?id=${team.idTeam}`;
        const playersRes = await fetch(playersUrl);
        const playersData = await playersRes.json();
        const players = playersData.player || [];

        console.log(`   Detailed players found: ${players.length}`);

        let playerCount = 0;
        for (const player of players) {
            if (!player.strPosition) continue;

            const playerSlug = slugify(player.strPlayer);
            const mockRating = Math.floor(Math.random() * (94 - 80 + 1) + 80);

            const playerTopic: Topic = {
                id: `player_${player.idPlayer}`,
                slug: playerSlug,
                title: player.strPlayer,
                type: 'player',
                description: player.strDescriptionEN ? player.strDescriptionEN.substring(0, 200) + "..." : `Player for ${team.strTeam}.`,
                metadata: {
                    avatar_url: player.strCutout || player.strThumb,
                    position: player.strPosition,
                    nationality: player.strNationality,
                    birth_date: player.dateBorn,
                    height: player.strHeight,
                    club_id: clubId,
                    club_slug: clubSlug,
                    club_name: team.strTeam,
                    rating: mockRating,
                    number: player.strNumber
                }
            };

            topics.push(playerTopic);
            playerCount++;
        }
        console.log(`   ✅ Added ${playerCount} Players`);
    }

    // Write DB
    const outputPath = path.resolve('packages/logic/src/mock-db/db.json');
    fs.writeFileSync(outputPath, JSON.stringify({ topics }, null, 2));

    console.log(`\n✨ Database seeded successfully!`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Total Topics: ${topics.length}`);
}

fetchData();
