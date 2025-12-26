import { config } from 'dotenv';
config();

const API_KEY = process.env.THESPORTSDB_API_KEY;

async function checkImages() {
    // Check Player Images (using Salah as example)
    console.log('🔍 Checking Player Images (Mo Salah)...\n');

    const playerUrl = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupplayer.php?id=34145506`;
    const playerRes = await fetch(playerUrl);
    const playerData = await playerRes.json();
    const player = playerData.players?.[0];

    if (player) {
        console.log('Available Player Images:');
        console.log('  strCutout (current):', player.strCutout || 'NULL');
        console.log('  strRender:', player.strRender || 'NULL');
        console.log('  strThumb:', player.strThumb || 'NULL');
        console.log('  strFanart1:', player.strFanart1 || 'NULL');
        console.log('  strFanart2:', player.strFanart2 || 'NULL');
        console.log('  strFanart3:', player.strFanart3 || 'NULL');
        console.log('  strFanart4:', player.strFanart4 || 'NULL');
    }

    // Check League Images (using Premier League as example)
    console.log('\n\n🔍 Checking League Images (Premier League)...\n');

    const leagueUrl = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupleague.php?id=4328`;
    const leagueRes = await fetch(leagueUrl);
    const leagueData = await leagueRes.json();
    const league = leagueData.leagues?.[0];

    if (league) {
        console.log('Available League Images:');
        console.log('  strLogo (current):', league.strLogo || 'NULL');
        console.log('  strBadge:', league.strBadge || 'NULL');
        console.log('  strTrophy:', league.strTrophy || 'NULL');
        console.log('  strBanner:', league.strBanner || 'NULL');
        console.log('  strFanart1:', league.strFanart1 || 'NULL');
        console.log('  strFanart2:', league.strFanart2 || 'NULL');
    }
}

checkImages();
