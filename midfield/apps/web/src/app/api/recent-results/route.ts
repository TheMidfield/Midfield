import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();

    // Fetch recent completed fixtures from the last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

    const { data, error } = await supabase
        .from('fixtures')
        .select(`
            id,
            date,
            home_score,
            away_score,
            status,
            home_team:topics!fixtures_home_team_id_fkey(id, title, slug, metadata),
            away_team:topics!fixtures_away_team_id_fkey(id, title, slug, metadata),
            competition:topics!fixtures_competition_id_fkey(title, slug)
        `)
        .eq('status', 'FT')
        .gte('date', twoDaysAgo.toISOString())
        .lte('date', new Date().toISOString())
        .order('date', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching recent results:', error);
        return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data || []);
}

export const revalidate = 300; // Cache for 5 minutes
