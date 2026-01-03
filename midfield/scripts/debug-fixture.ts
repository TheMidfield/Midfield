
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), 'midfield/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'midfield/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFixture() {
    console.log('🔍 Searching for recent Barcelona fixtures...');

    // Search for matches involving Barcelona
    const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('*')
        .or('home_team_name.ilike.%Barcelona%,away_team_name.ilike.%Barcelona%')
        .gte('date', '2026-01-01T00:00:00')
        .lte('date', '2026-02-01T00:00:00')
        .order('date', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (fixtures) {
        fixtures.forEach(f => {
            console.log(`\n⚽ ${f.home_team_name} vs ${f.away_team_name}`);
            console.log(`   ID: ${f.id}`);
            console.log(`   Date: ${f.date}`);
            console.log(`   Status: [${f.status}]`);
            console.log(`   Score: ${f.home_score} - ${f.away_score}`);
            console.log(`   Last Updated: ${f.updated_at}`);

            // Check if "stuck"
            if (['LIVE', 'HT', '1H', '2H'].includes(f.status)) {
                console.log('   ⚠️  WARNING: Match is marked LIVE/Active!');
            }
        });
    } else {
        console.log('No fixtures found.');
    }
}

debugFixture();
