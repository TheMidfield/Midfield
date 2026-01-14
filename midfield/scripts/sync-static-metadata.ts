import { createClient } from '@supabase/supabase-js';
import pLimit from 'p-limit';
import { config } from 'dotenv';
import { smartUpsertTopic } from '../packages/logic/src/sync/smart-upsert';
import type { Database } from '../packages/types/src/supabase';

config();

// Slugify helper
const slugify = (text: string): string => {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const isProduction = projectId === 'oerbyhaqhuixpjrubshm';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const API_KEY = process.env.THESPORTSDB_API_KEY || '3';
const CONCURRENCY = 3; // Low concurrency to respect API rate limits
const DELAY_MS = 600; // 600ms between requests = ~100 req/min
const limit = pLimit(CONCURRENCY);

// Rate-limited fetch
async function rateLimitedFetch(url: string): Promise<Response | null> {
    await new Promise(r => setTimeout(r, DELAY_MS));
    const res = await fetch(url);
    if (res.status === 429) {
        console.log('   ⏳ Rate limited, waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));
        return fetch(url);
    }
    return res.ok ? res : null;
}

const ALLOWED_LEAGUES = [
    'English Premier League', 'Spanish La Liga', 'German Bundesliga',
    'Italian Serie A', 'French Ligue 1'
];

let stats = { clubs: 0, coreClubs: 0, stubClubs: 0, players: 0, errors: 0 };

async function processClub(club: any, isCore: boolean) {
    const tsdbId = club.metadata?.external?.thesportsdb_id;
    if (!tsdbId) return;

    try {
        // 1. CORE clubs: sync players
        if (isCore) {
            const res = await rateLimitedFetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookup_all_players.php?id=${tsdbId}`);
            if (!res) { stats.errors++; return; }
            
            const data = await res.json();
            for (const p of (data.player || [])) {
                if (!p.strPlayer || !p.idPlayer) continue;
                
                const playerData = {
                    title: p.strPlayer,
                    slug: slugify(p.strPlayer),
                    type: 'player' as const,
                    description: p.strDescriptionEN?.substring(0, 300) || `Player for ${club.title}.`,
                    metadata: {
                        external: { thesportsdb_id: p.idPlayer, source: 'thesportsdb' },
                        photo_url: p.strCutout || p.strThumb,
                        render_url: p.strRender,
                        position: p.strPosition,
                        nationality: p.strNationality,
                        birth_date: p.dateBorn,
                        height: p.strHeight,
                        weight: p.strWeight,
                        jersey_number: p.strNumber ? parseInt(p.strNumber) : null
                    }
                };

                const result = await smartUpsertTopic(supabase, playerData, 'player', p.idPlayer);
                if (result.error?.message?.includes('duplicate key')) {
                    // Retry with unique slug
                    playerData.slug = `${slugify(p.strPlayer)}-${slugify(p.strNationality || club.title).substring(0, 3)}`;
                    await smartUpsertTopic(supabase, playerData, 'player', p.idPlayer);
                }
                if (!result.error) stats.players++;
            }
        }

        // 2. ALL clubs: sync club metadata
        const clubRes = await rateLimitedFetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupteam.php?id=${tsdbId}`);
        if (!clubRes) { stats.errors++; return; }
        
        const clubData = await clubRes.json();
        const t = clubData.teams?.[0];
        if (!t) return;

        const clubSyncData = {
            title: t.strTeam || club.title,
            slug: slugify(t.strTeam || club.title),
            type: 'club' as const,
            description: t.strDescriptionEN?.substring(0, 500) || club.description,
            metadata: {
                external: { thesportsdb_id: t.idTeam, source: 'thesportsdb' },
                badge_url: t.strBadge || t.strTeamBadge,
                stadium: t.strStadium,
                founded: t.intFormedYear ? parseInt(String(t.intFormedYear)) : null,
                league: t.strLeague,
                capacity: t.intStadiumCapacity ? parseInt(String(t.intStadiumCapacity)) : null
            }
        };

        const result = await smartUpsertTopic(supabase, clubSyncData, 'club', t.idTeam);
        if (!result.error) {
            stats.clubs++;
            if (isCore) stats.coreClubs++; else stats.stubClubs++;
        }
    } catch (err: any) {
        stats.errors++;
    }
}

async function main() {
    console.log('\n🚀 STATIC METADATA SYNC');
    console.log('═'.repeat(60));
    console.log(`🔍 Database: ${isProduction ? '✅ PRODUCTION' : '⚠️  DEVELOPMENT'} (${projectId})`);
    console.log(`⚡ Concurrency: ${CONCURRENCY}`);
    console.log('═'.repeat(60));

    const start = Date.now();

    // Fetch ALL clubs
    const { data: clubs } = await supabase
        .from('topics')
        .select('id, title, description, metadata')
        .eq('type', 'club')
        .not('metadata->external->>thesportsdb_id', 'is', null);

    if (!clubs) { console.error('❌ Failed to fetch clubs'); return; }

    const leagueSet = new Set(ALLOWED_LEAGUES);
    const coreCount = clubs.filter(c => leagueSet.has((c.metadata as any)?.league)).length;
    
    console.log(`\n📊 ${clubs.length} clubs (${coreCount} CORE + ${clubs.length - coreCount} STUB)`);
    console.log(`⏳ Estimated time: ~${Math.ceil(clubs.length * DELAY_MS / 1000 / 60)} minutes (rate limited)`);
    console.log('🔄 Processing...\n');

    // Progress tracker
    const interval = setInterval(() => {
        const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
        const progress = ((stats.clubs / clubs.length) * 100).toFixed(0);
        console.log(`⏱️  ${elapsed}m | ${progress}% | Clubs: ${stats.clubs} | Players: ${stats.players} | Errors: ${stats.errors}`);
    }, 10000);

    // Process all clubs
    await Promise.all(clubs.map(club => {
        const isCore = leagueSet.has((club.metadata as any)?.league);
        return limit(() => processClub(club, isCore));
    }));

    clearInterval(interval);

    const time = ((Date.now() - start) / 1000).toFixed(1);
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 COMPLETE');
    console.log('═'.repeat(60));
    console.log(`⏱️  Time: ${time}s`);
    console.log(`🏢 Clubs: ${stats.clubs} (${stats.coreClubs} CORE + ${stats.stubClubs} STUB)`);
    console.log(`👤 Players: ${stats.players}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('═'.repeat(60));
    console.log(isProduction ? '\n✅ PRODUCTION updated' : '\n⚠️  DEVELOPMENT updated');
}

main().catch(console.error);
