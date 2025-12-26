import { config } from 'dotenv';
config();

import { getRandomFeaturedPlayers } from '@midfield/logic/src/featured';


async function testFeaturedPlayers() {
    const players = await getRandomFeaturedPlayers(20);

    console.log(`Fetched ${players.length} featured players\n`);

    const declan = players.find(p => p.title?.toLowerCase().includes('declan'));

    if (declan) {
        console.log('Found Declan Rice in featured players:');
        console.log(JSON.stringify({
            title: declan.title,
            slug: declan.slug,
            id: declan.id,
            hasSlug: !!declan.slug
        }, null, 2));
    } else {
        console.log('Declan Rice not in this batch');
    }

    // Check for any players with missing/weird slugs
    const badSlugs = players.filter(p => !p.slug || p.slug.length < 3);
    if (badSlugs.length > 0) {
        console.log(`\n⚠️  Found ${badSlugs.length} players with suspicious slugs:`);
        badSlugs.forEach(p => {
            console.log(`  - ${p.title}: slug="${p.slug}"`);
        });
    }

    // Check slug format
    const withIds = players.filter(p => p.slug && p.slug.match(/-\d{8}$/));
    const withoutIds = players.filter(p => p.slug && !p.slug.match(/-\d{8}$/));

    console.log(`\nSlug formats:`);
    console.log(`  With ID suffix: ${withIds.length}`);
    console.log(`  Without ID suffix: ${withoutIds.length}`);

    if (withoutIds.length > 0) {
        console.log(`\nPlayers without ID suffix:`);
        withoutIds.slice(0, 5).forEach(p => {
            console.log(`  - ${p.title} (${p.slug})`);
        });
    }
}

testFeaturedPlayers();
