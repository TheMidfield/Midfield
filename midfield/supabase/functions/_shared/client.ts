
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

    // List all players for a team (Unlimited)
    async listTeamPlayers(teamId: string) {
        const data = await this.fetch<{ list: any[] }>(`/list/players/${teamId}`);
        return data.list || [];
    }

    // List all teams in a league
    async listLeagueTeams(leagueId: string) {
        const data = await this.fetch<{ list: any[] }>(`/list/teams/${leagueId}`);
        return data.list || [];
    }
}
