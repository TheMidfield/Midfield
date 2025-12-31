
export class TheSportsDBClient {
    private baseUrlV1 = 'https://www.thesportsdb.com/api/v1/json';
    private baseUrlV2 = 'https://www.thesportsdb.com/api/v2/json';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetchV1<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrlV1}/${this.apiKey}/${endpoint}`);
        if (!response.ok) {
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
        return this.fetchV1<{ teams: any[] }>(`lookupteam.php?id=${teamId}`);
    }

    async lookupPlayer(playerId: string) {
        return this.fetchV1<{ players: any[] }>(`lookupplayer.php?id=${playerId}`);
    }
}
