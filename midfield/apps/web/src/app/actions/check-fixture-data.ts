'use server';

import { createClient } from '@/lib/supabase/server';

export async function checkFixtureScores() {
    const supabase = await createClient();

    // Get a sample of past fixtures to check if we have scores
    const { data: pastFixtures, error } = await supabase
        .from('fixtures')
        .select('*')
        .lt('date', new Date().toISOString())
        .order('date', { ascending: false })
        .limit(10);

    if (error || !pastFixtures) {
        return { error: error?.message || 'No past fixtures found' };
    }

    // Check the structure of fixture data
    const sample = pastFixtures[0];
    const hasScores = sample && ('home_score' in sample || 'away_score' in sample || 'score' in sample || 'status' in sample);

    return {
        total: pastFixtures.length,
        sample: pastFixtures.slice(0, 3),
        fields: sample ? Object.keys(sample) : [],
        hasScores,
    };
}
