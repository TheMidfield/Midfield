import { createClient } from '@supabase/supabase-js';
import { TheSportsDBClient } from '../packages/logic/src/sync/client';
import { smartUpsertTopic } from '../packages/logic/src/sync/smart-upsert';
import { config } from 'dotenv';
import { slugify } from '../packages/logic/src/utils/slugify-utils'; // Need to make sure slugify exists or duplicate it

config();

// Helper if import fails
function simpleSlugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function main() {
    console.log('🌱 SEEDING MISSING CLUBS');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const apiClient = new TheSportsDBClient(process.env.THESPORTSDB_API_KEY || '3');

    // Clubs to add
    const MISSING_IDS = [
        '134259', // Las Palmas
        '133695', // Empoli
        '134234', // Venezia
        '134270'  // Monza
    ];

    for (const id of MISSING_IDS) {
        try {
            console.log(`\nFetching Club ID: ${id}...`);
            const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${process.env.THESPORTSDB_API_KEY}/lookupteam.php?id=${id}`);
            const data = await res.json();
            const t = data.teams?.[0];

            if (!t) {
                console.error(`❌ API returned no data for ${id}`);
                continue;
            }

            console.log(`   Found: ${t.strTeam}. Upserting...`);

            const clubTopic = {
                slug: simpleSlugify(t.strTeam),
                type: 'club',
                title: t.strTeam,
                description: t.strDescriptionEN?.substring(0, 500) || `The official profile of ${t.strTeam}.`,
                metadata: {
                    external: {
                        thesportsdb_id: t.idTeam,
                        source: 'thesportsdb'
                    },
                    badge_url: t.strBadge || t.strTeamBadge,
                    stadium: t.strStadium,
                    founded: t.intFormedYear ? parseInt(String(t.intFormedYear)) : null,
                    league: t.strLeague,
                    socials: {
                        website: t.strWebsite,
                        twitter: t.strTwitter,
                        instagram: t.strInstagram,
                        facebook: t.strFacebook
                    }
                },
                is_active: true
            };

            // Using raw upsert to be safe/fast locally without imports complexity
            const { data: existing } = await supabase.from('topics').select('id').eq('type', 'club').contains('metadata', { external: { thesportsdb_id: t.idTeam } }).maybeSingle();

            if (existing) {
                console.log(`   Club already exists (ID: ${existing.id}). Updating metadata...`);
                await supabase.from('topics').update({ metadata: clubTopic.metadata }).eq('id', existing.id);
            } else {
                // Try insert
                const { error } = await supabase.from('topics').insert(clubTopic);
                if (error) {
                    if (error.code === '23505') { // Slug collision
                        clubTopic.slug = `${clubTopic.slug}-${t.idTeam}`;
                        await supabase.from('topics').insert(clubTopic);
                        console.log(`   ✅ Created with slug suffix: ${clubTopic.slug}`);
                    } else {
                        console.error('   ❌ Insert failed:', error);
                    }
                } else {
                    console.log(`   ✅ Created: ${t.strTeam}`);
                }
            }

        } catch (err) {
            console.error('   ❌ Error:', err);
        }
    }
}

main().catch(console.error);
