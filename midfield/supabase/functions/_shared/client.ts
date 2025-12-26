
export class TheSportsDBClient {
    private baseUrl = 'https://www.thesportsdb.com/api/v2/json';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetchV2<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: { 'X-API-KEY': this.apiKey }
        });
        if (!response.ok) throw new Error(`API V2 Error: ${response.status}`);
        return response.json();
    }

    private async fetchV1<T>(endpoint: string): Promise<T> {
        // V1 uses URL-based auth: /v1/json/{key}/{endpoint}
        const v1Base = 'https://www.thesportsdb.com/api/v1/json';
        const url = `${v1Base}/${this.apiKey}/${endpoint}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API V1 Error: ${response.status}`);
        return response.json();
    }

    // List all players for a team (Unlimited)
    async listTeamPlayers(teamId: string) {
        const data = await this.fetchV2<{ list: any[] }>(`/list/players/${teamId}`);
        return data.list || [];
    }

    // List all teams in a league
    async listLeagueTeams(leagueId: string) {
        const data = await this.fetchV2<{ list: any[] }>(`/list/teams/${leagueId}`);
        return data.list || [];
    }


    // Individual Player Lookup (V1 - Full Details)
    async lookupPlayer(playerId: string) {
        const data = await this.fetchV1<{ players: any[] }>(`lookupplayer.php?id=${playerId}`);
        return data.players?.[0] || null;
    }

    // --- PHASE 2: AUXILIARY DATA ---


    async getTeamNextFixtures(teamId: string) {
        const data = await this.fetchV2<{ schedule: any[] }>(`/schedule/next/team/${teamId}`);
        return data.schedule || [];
    }

    async getTeamLastFixtures(teamId: string) {
        const data = await this.fetchV2<{ schedule: any[] }>(`/schedule/previous/team/${teamId}`);
        return data.schedule || [];
    }

    async getLeagueNextFixtures(leagueId: string) {
        // V2: /schedule/next/league/{id}
        const data = await this.fetchV2<{ schedule: any[] }>(`/schedule/next/league/${leagueId}`);
        return data.schedule || [];
    }

    async getLeagueLastFixtures(leagueId: string) {
        // V2: /schedule/previous/league/{id}
        const data = await this.fetchV2<{ schedule: any[] }>(`/schedule/previous/league/${leagueId}`);
        return data.schedule || [];
    }

    async getLeagueTable(leagueId: string, season: string) {
        // V1 endpoint: lookuptable.php?l={id}&s={season}
        const data = await this.fetchV1<{ table: any[] }>(`lookuptable.php?l=${leagueId}&s=${season}`);
        return data.table || [];
    }

    async getPlayerContracts(playerId: string) {
        // V2 endpoint: returns 'contracts' or 'lookup' depending on mood
        const data = await this.fetchV2<{ contracts?: any[], lookup?: any[] }>(`/lookup/player_contracts/${playerId}`);
        return data.contracts || data.lookup || [];
    }
}
