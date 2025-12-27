
// Sync Ratings Edge Function - Reconciles SoFIFA data by Global Matching & Self-Healing
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

// Inline CORS headers directly
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Simple Jaro-Winkler implementation
function jaroWinkler(s1: string, s2: string): number {
  let m = 0;
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    for (let j = start; j < end; j++) {
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
  for (let i = 0; i < len1; i++) {
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
    const p = 0.1;
    while (s1[l] === s2[l] && l < 4) l++;
    dw = dw + l * p * (1 - dw);
  }
  return dw;
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

    // 1. Try to find the Team Topic ID (for Self-Healing relationships)
    let teamId = null;
    const { data: teamDocs } = await supabase
      .from('topics')
      .select('id')
      .eq('type', 'club')
      .ilike('title', team)
      .limit(1);

    if (teamDocs && teamDocs.length > 0) {
      teamId = teamDocs[0].id;
    } else {
      console.warn(`⚠️ Team '${team}' not found. Ratings will be synced, but relationships cannot be healed.`);
    }

    const updates = [];
    const logs = [];
    const newRelationships = [];

    // 2. Iterate Players (Global Search Strategy)
    for (const scraped of players) {
      let match = null;
      let method = 'failed';
      let confidence = 0.0;

      // A. Is player already linked via ID in metadata?
      // We can't query JSONB easily in batch efficiently without a specialized index or search
      // So we will do a targeted search for EACH player.
      // It's slower (N queries) but safer.

      // Search by ID inside metadata (if we had indexed it, but we haven't)
      // OR Search by Title (Name)

      const { data: candidates, error } = await supabase
        .from('topics')
        .select('id, title, metadata')
        .eq('type', 'player')
        .ilike('title', scraped.name)
        .limit(5); // Get a few to check for ambiguity

      if (!error && candidates && candidates.length > 0) {
        // Try ID match first
        const idMatch = candidates.find(c => c.metadata?.external?.sofifa_id === scraped.sofifa_id);

        if (idMatch) {
          match = idMatch;
          method = 'id';
          confidence = 1.0;
        } else {
          // 2. Name Match + Birth Date (The "Smart" Match)
          // We iterate candidates to find the best one
          let bestCandidate = null;
          let bestScore = 0.0;
          let bestMethod = 'failed';

          for (const cand of candidates) {
            let score = 0.0;
            let currentMethod = 'ambiguous';

            // Name Similarity
            const nameScore = jaroWinkler(normalize(cand.title), normalize(scraped.name));

            // Birth Date Check (Golden Key)
            // DB might store as YYYY-MM-DD or ISO. Scraper sends YYYY-MM-DD (from pandas)
            const dbDob = cand.metadata?.birth_date?.split('T')[0];
            const scrapedDob = scraped.birth_date;

            if (scrapedDob && dbDob && scrapedDob === dbDob) {
              // If DOB matches, we trust it highly even with fuzzy name
              if (nameScore > 0.8) {
                score = 0.99;
                currentMethod = 'dob_match';
              }
            } else if (nameScore > 0.95) {
              // Very high name match (Exact-ish)
              score = 0.90;
              currentMethod = 'name_exact';
            } else if (nameScore > 0.85) {
              score = 0.85;
              currentMethod = 'name_fuzzy';
            }

            if (score > bestScore) {
              bestScore = score;
              bestCandidate = cand;
              bestMethod = currentMethod;
            }
          }

          if (bestScore >= 0.85) {
            match = bestCandidate;
            method = bestMethod;
            confidence = bestScore;
          } else if (candidates.length === 1 && bestScore > 0.8) {
            // Fallback: If only 1 candidate and it's decent
            match = candidates[0];
            method = 'single_candidate_fuzzy';
            confidence = 0.80;
          }
        }
      }

      // UPDATE
      if (match) {
        const fc26Data = {
          id: scraped.sofifa_id,
          slug: scraped.name.toLowerCase().replace(/\s+/g, '-'),
          overall: scraped.overall,
          potential: scraped.potential,
          stats: scraped.full_stats,
          match_confidence: confidence,
          last_updated: new Date().toISOString()
        };

        updates.push({
          id: match.id,
          fc26_data: fc26Data
        });

        logs.push({
          player_id: match.id,
          sofifa_name: scraped.name,
          sofifa_id: scraped.sofifa_id,
          match_confidence: confidence,
          match_method: method,
          match_details: { overall: scraped.overall, team: team }
        });

        // SELF-HEALING: Create Relationship if Team is known and not already linked?
        // Checking existence of relationship is expensive (another query). 
        // We can try to INSERT ON CONFLICT DO NOTHING if we had a constraint.
        // But 'relationships' usually doesn't have unique constraint on (from, to, type). 
        // We'll check first to be clean.
        if (teamId) {
          const { count } = await supabase
            .from('relationships')
            .select('*', { count: 'exact', head: true })
            .eq('from_id', match.id)
            .eq('to_id', teamId)
            .eq('type', 'member_of');

          if (count === 0) {
            newRelationships.push({
              from_id: match.id,
              to_id: teamId,
              type: 'member_of'
            });
          }
        }
      }
    }

    // Batch Execute
    let matchedCount = 0;

    // Updates
    for (const update of updates) {
      await supabase.from('topics').update({ fc26_data: update.fc26_data }).eq('id', update.id);
      matchedCount++;
    }

    // Relationships (Heal)
    if (newRelationships.length > 0) {
      try {
        await supabase.from('relationships').insert(newRelationships);
        console.log(`Healed ${newRelationships.length} relationships for ${team}`);
      } catch (e) {
        console.error("Error healing relationships:", e);
        // Table might be missing? We ignore to not break ratings sync
      }
    }

    // Logs
    if (logs.length > 0) {
      await supabase.from('player_match_log').insert(logs);
    }

    return new Response(
      JSON.stringify({
        message: 'Sync processed',
        team: team,
        processed: players.length,
        matched: matchedCount,
        healed: newRelationships.length
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
