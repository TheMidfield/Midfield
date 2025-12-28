
export class TheSportsDBClient {
    private baseUrl = 'https://www.thesportsdb.com/api/v2/json';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetch<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: { 'X-API-KEY': this.apiKey }
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    }

    // List all players for a team with FULL details (V1 API)
    // V2 /list/players only returns minimal data, we need V1 for complete info
    async listTeamPlayers(teamId: string) {
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${this.apiKey}/lookup_all_players.php?id=${teamId}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.player || [];
    }

    // List all teams in a league
    async listLeagueTeams(leagueId: string) {
        const data = await this.fetch<{ list: any[] }>(`/list/teams/${leagueId}`);
        return data.list || [];
    }

    // Lookup individual entities
    lookupLeague(id: string) { return this.fetch(`/lookup/league/${id}`); }
    lookupTeam(id: string) { return this.fetch(`/lookup/team/${id}`); }
}
