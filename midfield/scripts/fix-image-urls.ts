/**
 * FIX IMAGE URLS MIGRATION
 * 
 * Fixes all TheSportsDB image URLs that use the deprecated www.thesportsdb.com domain.
 * Replaces with the correct r2.thesportsdb.com CDN domain.
 * 
 * This is a one-time migration script.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixImageUrls() {
    console.log('🔧 FIX IMAGE URLS MIGRATION');
    console.log('═'.repeat(60));

    let fixed = 0;
    let scanned = 0;
    let errors = 0;

    // Fetch ALL topics with metadata
    const { data: topics, error } = await supabase
        .from('topics')
        .select('id, title, type, metadata');

    if (error || !topics) {
        console.error('Failed to fetch topics:', error);
        return;
    }

    console.log(`📊 Found ${topics.length} topics to scan\n`);

    for (const topic of topics) {
        scanned++;
        const metadata = topic.metadata as Record<string, any> | null;
        if (!metadata) continue;

        let needsUpdate = false;
        const updatedMetadata = { ...metadata };

        // Fields that may contain image URLs
        const imageFields = ['photo_url', 'render_url', 'badge_url', 'logo_url', 'trophy_url'];

        for (const field of imageFields) {
            const url = metadata[field];
            if (typeof url === 'string' && url.includes('www.thesportsdb.com')) {
                // Replace with R2 CDN
                updatedMetadata[field] = url.replace('www.thesportsdb.com', 'r2.thesportsdb.com');
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('topics')
                .update({ metadata: updatedMetadata })
                .eq('id', topic.id);

            if (updateError) {
                console.error(`❌ Failed to update ${topic.title}: ${updateError.message}`);
                errors++;
            } else {
                console.log(`✅ Fixed: ${topic.title} (${topic.type})`);
                fixed++;
            }
        }

        // Progress every 100 items
        if (scanned % 100 === 0) {
            console.log(`   📈 Progress: ${scanned}/${topics.length} scanned, ${fixed} fixed`);
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 MIGRATION COMPLETE');
    console.log('═'.repeat(60));
    console.log(`📊 Total scanned: ${scanned}`);
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`❌ Errors: ${errors}`);
}

fixImageUrls();
