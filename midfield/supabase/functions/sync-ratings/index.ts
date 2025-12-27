
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"

// Initialize Jaro-Winkler for fuzzy matching
// Simple implementation since we can't easily import external libs in Deno without proper mapping
function jaroWinkler(s1: string, s2: string): number {
  let m = 0;
  let i = 0;
  let j = 0;

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  for (i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    for (j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      m++;
      break;
    }
  }

  if (m === 0) return 0.0;

  let k = 0;
  let t = 0;
  for (i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) t++;
    k++;
  }
  t /= 2;

  let dw = ((m / len1) + (m / len2) + ((m - t) / m)) / 3.0;

  // Winkler modification
  let l = 0;
  if (dw > 0.7) {
    while (l < 4 && l < len1 && l < len2 && s1[l] === s2[l]) l++;
    dw += l * 0.1 * (1 - dw);
  }

  return dw;
}

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { team, players } = await req.json();

    if (!team || !players || !Array.isArray(players)) {
      throw new Error('Invalid payload format');
    }

    console.log(`Processing ${players.length} players for team: ${team}`);

    // 1. Fetch potential matches (players in matched team)
    // First, find the team ID
    const { data: teamDocs, error: teamError } = await supabase
      .from('topics')
      .select('id')
      .eq('type', 'club')
      .ilike('title', team) // Simple team name match for now
      .limit(1);

    if (teamError) throw teamError;

    let dbPlayers: any[] = [];

    if (teamDocs && teamDocs.length > 0) {
      const teamId = teamDocs[0].id;
      // Get players linked to this team
      // Note: Assuming relationships table links player -> team
      const { data, error } = await supabase
        .from('relationships')
        .select(`
            from_id,
            topics!relationships_from_id_fkey (id, title, metadata)
        `)
        .eq('to_id', teamId)
        .eq('type', 'member_of');

      if (!error && data) {
        dbPlayers = data.map((d: any) => d.topics);
      }
    } else {
      console.warn(`Team '${team}' not found in DB. Doing global name match only.`);
    }

    const updates = [];
    const logs = [];

    for (const scraped of players) {
      let match = null;
      let method = 'failed';
      let confidence = 0.0;

      // 1. ID MATCH (Best)
      const idMatch = dbPlayers.find((p: any) => p.metadata?.fc26?.id === scraped.sofifa_id);
      if (idMatch) {
        match = idMatch;
        method = 'id';
        confidence = 1.0;
      }

      // 2. EXACT NAME MATCH (Team Scoped)
      if (!match) {
        const exact = dbPlayers.find((p: any) =>
          normalize(p.title) === normalize(scraped.name) ||
          normalize(p.title) === normalize(scraped.name.split(' ').pop() || '') // Last name check
        );
        if (exact) {
          match = exact;
          method = 'exact_team';
          confidence = 0.95;
        }
      }

      // 3. FUZZY MATCH (Team Scoped)
      if (!match && dbPlayers.length > 0) {
        let bestScore = 0;
        let bestCand = null;

        for (const cand of dbPlayers) {
          const score = jaroWinkler(normalize(cand.title), normalize(scraped.name));
          if (score > bestScore) {
            bestScore = score;
            bestCand = cand;
          }
        }

        if (bestScore > 0.85) {
          match = bestCand;
          method = 'fuzzy_team';
          confidence = bestScore;
        }
      }

      // 4. GLOBAL FALLBACK (Only for high value players to avoid false positives)
      if (!match && scraped.overall > 82) {
        const { data: globalData } = await supabase
          .from('topics')
          .select('id, title, metadata')
          .eq('type', 'player')
          .ilike('title', scraped.name)
          .limit(1);

        if (globalData && globalData.length > 0) {
          match = globalData[0];
          method = 'global';
          confidence = 0.85;
        }
      }

      // UPDATE Logic
      if (match) {
        const newMetadata = {
          ...match.metadata,
          fc26: {
            id: scraped.sofifa_id,
            slug: scraped.name.toLowerCase().replace(/\s+/g, '-'),
            overall: scraped.overall,
            potential: scraped.potential,
            // Store detailed stats grouped or flat? Plan said grouped but user asked for "individual".
            // We store "full_stats" which has everything flattened
            stats: scraped.full_stats,
            match_confidence: confidence,
            last_updated: new Date().toISOString()
          }
        };

        updates.push({
          id: match.id,
          metadata: newMetadata
        });

        logs.push({
          player_id: match.id,
          sofifa_name: scraped.name,
          sofifa_id: scraped.sofifa_id,
          match_confidence: confidence,
          match_method: method,
          match_details: { overall: scraped.overall, team: team }
        });
      }
    }

    // Batch execute updates
    if (updates.length > 0) {
      // Upsert topics (bulk update metadata)
      // Note: Supabase JS library doesn't support bulk update of specific columns nicely without upsert
      // We iterate for safety or use a stored procedure. For < 50 items iteration is fine.
      for (const update of updates) {
        await supabase.from('topics').update({ metadata: update.metadata }).eq('id', update.id);
      }

      // Insert logs
      await supabase.from('player_match_log').insert(logs);
    }

    return new Response(
      JSON.stringify({
        message: 'Sync processed',
        team: team,
        processed: players.length,
        matched: updates.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
