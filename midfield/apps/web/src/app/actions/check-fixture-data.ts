'use server';

import { createClient } from '@/lib/supabase/server';

export async function checkFixtureData() {
    const supabase = await createClient();

    // Get fixture statistics
    const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('date')
        .order('date', { ascending: true });

    if (error || !fixtures) {
        return { error: error?.message || 'No fixtures found' };
    }

    const now = new Date();
    const today = new Date(now.toDateString());

    const past = fixtures.filter(f => new Date(f.date) < now);
    const future = fixtures.filter(f => new Date(f.date) >= now);
    const todayFixtures = fixtures.filter(f => {
        const fixtureDate = new Date(f.date);
        return fixtureDate.toDateString() === today.toDateString();
    });

    // Check when clubs were last updated
    const { data: clubs } = await supabase
        .from('topics')
        .select('updated_at')
        .eq('type', 'club')
        .order('updated_at', { ascending: false })
        .limit(10);

    return {
        total: fixtures.length,
        past: past.length,
        future: future.length,
        today: todayFixtures.length,
        earliest: fixtures[0]?.date,
        latest: fixtures[fixtures.length - 1]?.date,
        recentUpdates: clubs?.map(c => c.updated_at).slice(0, 5) || [],
        samplePast: past.slice(-5).map(f => f.date),
        sampleFuture: future.slice(0, 5).map(f => f.date),
    };
}
