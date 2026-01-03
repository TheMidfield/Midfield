
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
        if (!response.ok) {
            // V2 might return 404 for empty data, handle gracefully
            if (response.status === 404) return {} as T;
            throw new Error(`API V2 Error: ${response.status}`);
        }
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

    // === SYNC-CRITICAL METHODS ===

    // League schedule (V2) - for daily sync
    async getLeagueSchedule(leagueId: string, season: string) {
        return this.fetchV2<{ events: any[] }>(`/schedule/league/${leagueId}/${season}`);
    }

    // Livescores (V2) - for realtime updates
    async getLivescores(leagueId?: string) {
        const endpoint = leagueId ? `/livescore/${leagueId}` : '/livescore/soccer';
        return this.fetchV2<{ events: any[] }>(endpoint);
    }

    // Upcoming fixtures (V2)
    async getUpcomingFixtures(leagueId: string) {
        return this.fetchV2<{ events: any[] }>(`/schedule/next/league/${leagueId}`);
    }

    // Previous results (V2)
    async getPreviousResults(leagueId: string) {
        return this.fetchV2<{ events: any[] }>(`/schedule/previous/league/${leagueId}`);
    }

    // Individual event lookup (V1) - for Vanish Protocol
    async lookupEvent(eventId: string) {
        const data = await this.fetchV1<{ events: any[] }>(`lookupevent.php?id=${eventId}`);
        return data.events?.[0] || null;
    }

    // Past events fallback (V1) - Safety net
    async getPastLeagueEvents(leagueId: string) {
        const data = await this.fetchV1<{ events: any[] }>(`eventspastleague.php?id=${leagueId}`);
        return data.events || [];
    }

    // League table/standings (V1)
    async getLeagueTable(leagueId: string, season: string) {
        const data = await this.fetchV1<{ table: any[] }>(`lookuptable.php?l=${leagueId}&s=${season}`);
        return data.table || [];
    }

    // === METADATA METHODS ===

    // List all players for a team (V1 for FULL details)
    async listTeamPlayers(teamId: string) {
        const data = await this.fetchV1<{ player: any[] }>(`lookup_all_players.php?id=${teamId}`);
        return data.player || [];
    }

    // List all teams in a league (V2)
    async listLeagueTeams(leagueId: string) {
        const data = await this.fetchV2<{ list: any[] }>(`/list/teams/${leagueId}`);
        return data.list || [];
    }

    // Individual lookups
    async lookupPlayer(playerId: string) {
        const data = await this.fetchV1<{ players: any[] }>(`lookupplayer.php?id=${playerId}`);
        return data.players?.[0] || null;
    }

    async lookupTeam(teamId: string) {
        const data = await this.fetchV1<{ teams: any[] }>(`lookupteam.php?id=${teamId}`);
        return data.teams?.[0] || null;
    }

    async getLeagueDetails(leagueId: string) {
        const data = await this.fetchV1<{ leagues: any[] }>(`lookupleague.php?id=${leagueId}`);
        return data.leagues?.[0] || null;
    }

    // Team fixtures
    async getTeamNextFixtures(teamId: string) {
        const data = await this.fetchV2<{ schedule: any[] }>(`/schedule/next/team/${teamId}`);
        return data.schedule || [];
    }

    async getTeamLastFixtures(teamId: string) {
        const data = await this.fetchV2<{ schedule: any[] }>(`/schedule/previous/team/${teamId}`);
        return data.schedule || [];
    }
}
