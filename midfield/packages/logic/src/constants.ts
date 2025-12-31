
export const ALLOWED_LEAGUES = [
    "English Premier League",
    "Spanish La Liga",
    "German Bundesliga",
    "Italian Serie A",
    "French Ligue 1"
];

// Helper to check if a club is in allowed leagues
export const isVisibleClub = (leagueName?: string) => {
    if (!leagueName) return false;
    return ALLOWED_LEAGUES.includes(leagueName);
};
