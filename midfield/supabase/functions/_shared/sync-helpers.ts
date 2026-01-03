// Deno port of critical helper functions from simple-fixture-sync.ts
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export async function createStub(
    supabase: SupabaseClient,
    thesportsdbId: string,
    name: string,
    type: 'club' | 'league' | 'player',
    badgeUrl?: string
) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + `-${thesportsdbId}`;

    const metadata: any = {
        is_stub: true,
        external: {
            thesportsdb_id: thesportsdbId,
            source: 'thesportsdb'
        }
    };

    if (badgeUrl) {
        metadata.badge_url = badgeUrl;
    } else if (type === 'player') {
        metadata.photo_url = null;
    }

    const { data, error } = await supabase.from('topics').insert({
        title: name,
        slug,
        type,
        is_active: true,
        metadata,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} profile.`
    }).select('id').single();

    if (error) {
        console.error(`Failed to create stub for ${name}:`, error);
        return null;
    }

    return data?.id || null;
}

export function getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}
