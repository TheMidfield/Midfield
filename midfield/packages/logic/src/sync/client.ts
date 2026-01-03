
export class TheSportsDBClient {
    private baseUrlV1 = 'https://www.thesportsdb.com/api/v1/json';
    private baseUrlV2 = 'https://www.thesportsdb.com/api/v2/json';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetchV1<T>(endpoint: string, retries = 3): Promise<T> {
        const response = await fetch(`${this.baseUrlV1}/${this.apiKey}/${endpoint}`);

        if (!response.ok) {
            // 429 Rate Limit Handling with Exponential Backoff
            if (response.status === 429 && retries > 0) {
                const delay = 2000 * Math.pow(2, 3 - retries); // 2s, 4s, 8s
                console.warn(`⚠️ Rate limit hit on ${endpoint}. Retrying in ${delay}ms... (Attempts left: ${retries})`);
                await new Promise(r => setTimeout(r, delay));
                return this.fetchV1(endpoint, retries - 1);
            }
            throw new Error(`TheSportsDB V1 API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    private async fetchV2<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrlV2}${endpoint}`, {
            headers: {
                'X-API-KEY': this.apiKey
            }
        });

        if (!response.ok) {
            // V2 might return 404 for empty data, handle gracefully
            if (response.status === 404) return {} as T;
            throw new Error(`TheSportsDB V2 API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    // --- V2 Methods (Preferred) ---

    async getLeagueSchedule(leagueId: string, season: string) {
        // V2: /schedule/league/{id}/{season}
        return this.fetchV2<{ events: any[] }>(`/schedule/league/${leagueId}/${season}`);
    }

    async getLivescores(leagueId?: string) {
        // V2: /livescore/{id} or /livescore/soccer
        const endpoint = leagueId ? `/livescore/${leagueId}` : '/livescore/soccer';
        return this.fetchV2<{ events: any[] }>(endpoint);
    }

    async getPreviousResults(leagueId: string) {
        // V2: /schedule/previous/league/{id}
        return this.fetchV2<{ events: any[] }>(`/schedule/previous/league/${leagueId}`);
    }

    async getUpcomingFixtures(leagueId: string) {
        // V2: /schedule/next/league/{id}
        return this.fetchV2<{ events: any[] }>(`/schedule/next/league/${leagueId}`);
    }

    // Lookup individual entities (V2)
    lookupLeague(id: string) { return this.fetchV2(`/lookup/league/${id}`); }
    lookupTeamV2(id: string) { return this.fetchV2(`/lookup/team/${id}`); } // Renamed to avoid conflict with V1 lookupTeam

    // Get league details (V1 fallback for more complete data including badge)
    async getLeagueDetails(leagueId: string) {
        const data = await this.fetchV1<{ leagues: any[] }>(`lookupleague.php?id=${leagueId}`);
        return data.leagues?.[0] || null;
    }

    // --- V1 Methods (Legacy/Fallback) ---

    // List all players for a team with FULL details (V1 API)
    // V2 /list/players only returns minimal data, we need V1 for complete info
    async listTeamPlayers(teamId: string) {
        const data = await this.fetchV1<{ player: any[] }>(`lookup_all_players.php?id=${teamId}`);
        return data.player || [];
    }

    // List all teams in a league (V2 endpoint, but using V1 for consistency with other list methods if needed)
    // Original was V2, keeping it V2 for now.
    async listLeagueTeams(leagueId: string) {
        const data = await this.fetchV2<{ list: any[] }>(`/list/teams/${leagueId}`);
        return data.list || [];
    }

    async searchTeams(league: string) {
        return this.fetchV1<{ teams: any[] }>(`search_all_teams.php?l=${encodeURIComponent(league)}`);
    }

    async lookupTeam(teamId: string) { // This is the V1 lookupTeam
        const data = await this.fetchV1<{ teams: any[] }>(`lookupteam.php?id=${teamId}`);
        return data.teams?.[0] || null;
    }

    async lookupPlayer(playerId: string) {
        const data = await this.fetchV1<{ players: any[] }>(`lookupplayer.php?id=${playerId}`);
        return data.players?.[0] || null;
    }

    async getLeagueTable(leagueId: string, season: string) {
        const data = await this.fetchV1<{ table: any[] }>(`lookuptable.php?l=${leagueId}&s=${season}`);
        return data.table || [];
    }

    async getPlayerContracts(playerId: string) {
        // V2 endpoint for contracts (requires paid tier usually or v2 access)
        // If it fails (404/401), fetchV2 returns empty or throws.
        // We will assume V2 access or graceful failure.
        const data = await this.fetchV2<{ contracts: any[] }>(`/lookup/contract/${playerId}`);
        return data.contracts || [];
    }

    // --- Critical Reliability Methods ---

    // V1 fallback for past league events because V2 /schedule/previous often returns 404/empty
    // This is the "Safety Net" for the sync engine
    async getPastLeagueEvents(leagueId: string) {
        const data = await this.fetchV1<{ events: any[] }>(`eventspastleague.php?id=${leagueId}`);
        return data.events || [];
    }

    // Specific lookup for the Vanish Protocol (Single Match Granular Sync)
    async lookupEvent(eventId: string) {
        const data = await this.fetchV1<{ events: any[] }>(`lookupevent.php?id=${eventId}`);
        return data.events?.[0] || null;
    }
}
