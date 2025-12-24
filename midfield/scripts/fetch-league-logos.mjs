// Simple script to fetch and store league logos from Brandfetch
// Run once: node scripts/fetch-league-logos.mjs

const BRANDFETCH_CLIENT_ID = '1iduYNtvvGbDAqeqWqr';
const LEAGUE_DOMAINS = {
    'English Premier League': 'premierleague.com',
    'Spanish La Liga': 'laliga.com',
    'Italian Serie A': 'legaseriea.it',
    'German Bundesliga': 'bundesliga.com',
    'French Ligue 1': 'ligue1.com'
};

async function fetchLeagueLogos() {
    const logos = {};

    for (const [league, domain] of Object.entries(LEAGUE_DOMAINS)) {
        try {
            console.log(`Fetching logo for ${league}...`);

            const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
                headers: {
                    'Authorization': `Bearer ${BRANDFETCH_CLIENT_ID}`
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch ${league}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();

            // Extract logo URL (prefer SVG, fallback to PNG)
            const logoUrl = data.logos?.[0]?.formats?.find(f => f.format === 'svg')?.src
                || data.logos?.[0]?.formats?.find(f => f.format === 'png')?.src;

            if (logoUrl) {
                logos[league] = logoUrl;
                console.log(`✓ ${league}: ${logoUrl}`);
            } else {
                console.warn(`✗ No logo found for ${league}`);
            }

        } catch (error) {
            console.error(`Error fetching ${league}:`, error.message);
        }
    }

    console.log('\n\nLeague Logos Object (add to your league metadata):');
    console.log(JSON.stringify(logos, null, 2));
}

fetchLeagueLogos();
