import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enqueueEnrichment() {
    console.log('🔍 Finding players with missing metadata...');

    // Find all players missing height, nationality, or jersey_number
    const { data: players, error } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'player');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const needsEnrichment = players?.filter(p => {
        const meta = p.metadata as any;
        return !meta?.height || !meta?.nationality || meta?.jersey_number === null;
    }) || [];

    console.log(`Found ${needsEnrichment.length} players needing enrichment.`);

    if (needsEnrichment.length === 0) {
        console.log('✅ All players are already enriched!');
        return;
    }

    // Create enrichment jobs
    const jobs = needsEnrichment.map(player => {
        const meta = player.metadata as any;
        return {
            job_type: 'enrich_player',
            payload: {
                playerId: player.id,
                thesportsdbId: meta?.external?.thesportsdb_id
            },
            status: 'pending'
        };
    }).filter(job => job.payload.thesportsdbId); // Only if we have TheSportsDB ID

    console.log(`📋 Enqueueing ${jobs.length} enrichment jobs...`);

    // Insert in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase.from('sync_jobs').insert(batch);
        if (insertError) {
            console.error('Insert error:', insertError);
        } else {
            console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} enqueued (${batch.length} jobs)`);
        }
    }

    console.log('');
    console.log('✨ All jobs enqueued!');
    console.log('🚀 Trigger the worker with: npx tsx scripts/trigger-sync-worker.ts');
}

enqueueEnrichment();
