import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UEFA_CLUB_RANKINGS: Record<string, number> = {
    'real-madrid': 1, 'bayern-munich': 2, 'bayern-munchen': 2, 'inter-milan': 3, 'internazionale': 3, 'inter': 3,
    'manchester-city': 4, 'liverpool': 5, 'paris-saint-germain': 6, 'psg': 6, 'borussia-dortmund': 7,
    'bayer-leverkusen': 8, 'barcelona': 9, 'fc-barcelona': 9, 'arsenal': 10, 'atletico-madrid': 11,
    'chelsea': 12, 'as-roma': 13, 'roma': 13, 'benfica': 14, 'sl-benfica': 14, 'eintracht-frankfurt': 15,
    'atalanta': 16, 'manchester-united': 17, 'psv-eindhoven': 18, 'psv': 18, 'feyenoord': 19,
    'club-brugge': 20, 'sporting-cp': 21, 'sporting-lisbon': 21, 'tottenham-hotspur': 22, 'tottenham': 22,
    'spurs': 22, 'fiorentina': 23, 'west-ham-united': 24, 'west-ham': 24, 'juventus': 25,
    'ac-milan': 15, 'milan': 15, 'napoli': 16, 'lazio': 25, 'monaco': 20, 'as-monaco': 20, 'lyon': 23,
    'olympique-lyonnais': 23, 'marseille': 24, 'olympique-de-marseille': 24, 'lille': 25, 'losc-lille': 25,
    'aston-villa': 26, 'newcastle': 27, 'newcastle-united': 27, 'brighton': 28, 'brighton-hove-albion': 28,
    'rb-leipzig': 18, 'stuttgart': 30
};

const LEAGUE_PRESTIGE: Record<string, number> = {
    'english-premier-league': 6, 'premier-league': 6, 'la-liga': 5, 'spanish-la-liga': 5,
    'serie-a': 5, 'italian-serie-a': 5, 'italian-serie-a-4332': 5, 'spanish-la-liga-4335': 5,
    'french-ligue-1-4334': 4, 'bundesliga': 5, 'german-bundesliga': 5,
    'ligue-1': 4, 'french-ligue-1': 4, 'champions-league': 7, 'uefa-champions-league': 7,
    'europa-league': 5, 'uefa-europa-league': 5,
};

async function main() {
    console.log('🤖 DEBUG V5 SCORING TRACE');

    // Fetch fixtures for Arsenal/Bournemouth and Como/Udinese
    const { data: fixtures } = await supabase
        .from('fixtures')
        .select(`
            id, date,
            homeTeam:topics!fixtures_home_team_id_fkey(id, title, slug),
            awayTeam:topics!fixtures_away_team_id_fkey(id, title, slug),
            competition:topics!fixtures_competition_id_fkey(slug)
        `)
        .or('home_team_name.ilike.%Bournemouth%,home_team_name.ilike.%Genoa%,home_team_name.ilike.%Como%,home_team_name.ilike.%Udinese%') // Added Como/Udinese
        .gte('date', new Date().toISOString());

    // Fetch Standings
    const { data: standings } = await supabase.from('league_standings').select('*');
    const standingsMap = new Map();
    standings?.forEach(s => standingsMap.set(s.team_id, s));

    fixtures?.forEach(f => {
        const homeSlug = f.homeTeam?.slug.replace(/-\d+$/, '');
        const awaySlug = f.awayTeam?.slug.replace(/-\d+$/, '');
        const homeUefa = UEFA_CLUB_RANKINGS[homeSlug] || 50;
        const awayUefa = UEFA_CLUB_RANKINGS[awaySlug] || 50;
        const leagueSlug = f.competition?.slug.replace(/-\d+$/, '');
        const leaguePrestige = LEAGUE_PRESTIGE[leagueSlug] || 1;

        if ((f.homeTeam.title.includes('Bournemouth') && f.awayTeam.title.includes('Arsenal')) ||
            (f.homeTeam.title.includes('Como') || f.homeTeam.title.includes('Genoa'))) {

            console.log(`\n⚽ MATCH: ${f.homeTeam?.title} vs ${f.awayTeam?.title}`);
            console.log(`   Slugs: ${homeSlug} (${homeUefa}) vs ${awaySlug} (${awayUefa})`);

            let importance = 0;

            // 1. Star Power
            const bestUefaRank = Math.min(homeUefa, awayUefa);
            if (bestUefaRank <= 10) { importance += 20; console.log('   +20 Star Power (Super Giant)'); }
            else if (bestUefaRank <= 20) { importance += 12; console.log('   +12 Star Power (Top Tier)'); }
            else if (bestUefaRank <= 30) { importance += 6; console.log('   +6 Star Power (Solid)'); }

            // 2. Match Quality
            const avgUefa = (homeUefa + awayUefa) / 2;
            if (avgUefa <= 20) { importance += 10; console.log('   +10 Quality'); }
            else if (avgUefa <= 40) { importance += 5; console.log('   +5 Quality'); }

            // 3. Prestige
            importance += leaguePrestige * 5;
            console.log(`   +${leaguePrestige * 5} Prestige (${leagueSlug})`);

            // 4. Standings
            const hStand = standingsMap.get(f.homeTeam.id);
            const aStand = standingsMap.get(f.awayTeam.id);

            if (hStand && aStand) {
                console.log(`   Standings: ${hStand.position} vs ${aStand.position}`);
                // V5 Logic
                const posDiff = Math.abs(hStand.position - aStand.position);
                let proximityBonus = Math.max(0, 15 - posDiff * 2);

                const bestLeagueRank = Math.min(hStand.position, aStand.position);
                const tableRelevance = Math.max(0, (20 - bestLeagueRank) / 20);

                const finalBonus = proximityBonus * tableRelevance;
                importance += finalBonus;
                console.log(`   +${finalBonus.toFixed(2)} Standings (Prox: ${proximityBonus} * Scale: ${tableRelevance.toFixed(2)})`);

                if (hStand.position <= 5 && aStand.position <= 5) {
                    importance += 10;
                    console.log('   +10 Title Race');
                }
            } else {
                console.log('   ❌ Missing Standings');
            }

            console.log(`   TOTAL SCORE: ${importance.toFixed(2)}`);
        }
    });
}

main().catch(console.error);
