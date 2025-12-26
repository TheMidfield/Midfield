
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const API_KEY = process.env.THESPORTSDB_API_KEY;

async function checkApi(teamId: string) {
    console.log(`Checking API for Team: ${teamId}...`);
    const url = `https://www.thesportsdb.com/api/v2/json/list/players/${teamId}`;
    const res = await fetch(url, {
        headers: { 'X-API-KEY': API_KEY || '' }
    });
    const data = await res.json();

    // Find Saka
    const saka = data.list?.find((p: any) => p.strPlayer.includes('Saka'));
    if (saka) {
        console.log('--- API Response (Saka) ---');
        console.log('strHeight:', saka.strHeight);
        console.log('strNationality:', saka.strNationality);
        console.log('strNumber:', saka.strNumber);
        console.log('strWeight:', saka.strWeight);
    } else {
        console.log('Saka not found in team list.');
    }
}

// Arsenal ID: 133604
checkApi('133604');
