import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('Fetching all LEAGUE topics...');
    const { data: leagues, error } = await supabase
        .from('topics')
        .select('id, title, slug, type, metadata, is_active')
        .eq('type', 'league');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${leagues.length} leagues.`);
    leagues.forEach(l => {
        console.log(`[${l.id}] ${l.title} (${l.slug})`);
        console.log(`   Active: ${l.is_active}`);
        console.log(`   Metadata:`, JSON.stringify(l.metadata));

        // specific check for continental
        const isCont = l.metadata?.competition_type === 'continental' || ['uefa-champions-league', 'uefa-europa-league'].includes(l.slug);
        console.log(`   IsContinental Detected: ${isCont}`);
        console.log('---');
    });
}

main();
