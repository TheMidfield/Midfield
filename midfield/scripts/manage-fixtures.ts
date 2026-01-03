
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env from both locations to be safe
dotenv.config({ path: path.resolve(process.cwd(), "midfield/.env") });
dotenv.config({ path: path.resolve(process.cwd(), "midfield/.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const KILL_MODE = process.argv.includes('--kill');
const ID_TO_KILL = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1];

async function main() {
    console.log(`💀 Grim Reaper Manual Tool ${KILL_MODE ? '[KILL MODE ACTIVE]' : '[SCAN ONLY]'}`);

    // If specific ID is targeting
    if (ID_TO_KILL) {
        if (!KILL_MODE) {
            console.log(`Checking specific match ID: ${ID_TO_KILL}`);
            const { data: match } = await supabase.from('fixtures').select('*').eq('id', ID_TO_KILL).single();
            if (match) printMatch(match);
            else console.log("Match not found.");
            return;
        } else {
            console.log(`⚰️  Force killing match ID: ${ID_TO_KILL}`);
            const { error } = await supabase.from('fixtures').update({ status: 'FT', updated_at: new Date().toISOString() }).eq('id', ID_TO_KILL);
            if (error) console.error("Error:", error);
            else console.log("✅ Match buried.");
            return;
        }
    }

    // Scan for Zombies
    const now = new Date();
    // 4 hours ago
    const cutoff = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();

    const { data: zombies, error } = await supabase
        .from('fixtures')
        .select('*')
        .in('status', ['LIVE', 'HT'])
        // Fetch ALL active matches to be sure, then filter by date in JS if needed, but DB filter is better
        // .lt('date', cutoff)
        .order('date', { ascending: false });

    if (error) {
        console.error("Failed to fetch zombies:", error);
        return;
    }

    if (!zombies || zombies.length === 0) {
        console.log("✅ No zombie matches found! (Active matches > 4h old)");
    } else {
        console.log(`⚠️  Found ${zombies.length} ZOMBIE matches:`);
        zombies.forEach(printMatch);

        if (KILL_MODE) {
            console.log(`\n🔪 Killing ${zombies.length} matches...`);
            const ids = zombies.map(z => z.id);
            const { error: killError } = await supabase
                .from('fixtures')
                .update({ status: 'FT', updated_at: new Date().toISOString() })
                .in('id', ids);

            if (killError) console.error("❌ Failed to kill zombies:", killError);
            else console.log("✅ All zombies have been buried.");
        } else {
            console.log("\n💡 Run with --kill to force finish them.");
            console.log("💡 Run with --id=123 --kill to finish a specific match.");
        }
    }
}

function printMatch(m: any) {
    const d = new Date(m.date);
    console.log(`   Stubborn Match: ${m.home_team_name} ${m.home_score ?? '?'} - ${m.away_score ?? '?'} ${m.away_team_name}`);
    console.log(`     ID: ${m.id}`);
    console.log(`     Date: ${d.toLocaleString()}`);
    console.log(`     Status: [${m.status}]`);
    console.log(`     Last Update: ${m.updated_at ? new Date(m.updated_at).toLocaleString() : 'Never'}`);
    console.log('---');
}

main();
