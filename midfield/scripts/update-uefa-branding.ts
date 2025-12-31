import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const UEFA_LOGO = 'https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/uefa.png';
const IDS = ['4480', '4481']; // CL, EL

async function main() {
    for (const id of IDS) {
        // Fetch current metadata
        const { data } = await supabase.from('topics')
            .select('metadata')
            .contains('metadata', { external: { thesportsdb_id: id } })
            .single();

        if (!data) {
            console.log(`Topic ${id} not found.`);
            continue;
        }

        const newMetadata = {
            ...data.metadata,
            logo_url: UEFA_LOGO,
            logo_url_dark: UEFA_LOGO, // Use same for dark mode or maybe different? User gave one link.
            // Maybe also badge_url? User says "flag". League page uses logo_url typically.
        };

        const { error } = await supabase.from('topics')
            .update({ metadata: newMetadata })
            .contains('metadata', { external: { thesportsdb_id: id } });

        if (error) console.error(error);
        else console.log(`Updated branding for ${id}`);
    }
}
main();
