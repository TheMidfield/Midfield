
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

    // 2. OPTIMAL MATCHING: Get club's player pool first
    let clubPlayers: any[] = [];
    if (teamId) {
      const { data: clubData } = await supabase
        .from('topic_relationships')
        .select('child_topic:topics!topic_relationships_child_topic_id_fkey(id, title, metadata)')
        .eq('parent_topic_id', teamId)
        .eq('relationship_type', 'plays_for');

      if (clubData) {
        clubPlayers = clubData.map((r: any) => r.child_topic).filter(Boolean);
        console.log(`📋 Found ${clubPlayers.length} players in club pool`);
      }
    }

    // Helper: Normalize name (remove accents, lowercase)
    const normalizeName = (name: string): string => {
      return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .trim();
    };

    // Helper: Find best match in a pool using multi-signal scoring
    const findBestMatch = (scraped: any, pool: any[]) => {
      let bestMatch = null;
      let bestScore = 0;
      let bestMethod = 'failed';

      const scrapedNorm = normalizeName(scraped.name);
      const scrapedTokens = scrapedNorm.split(/\s+/);
      const scrapedDob = scraped.birth_date;

      for (const cand of pool) {
        const candNorm = normalizeName(cand.title);
        const candDob = cand.metadata?.birth_date?.split('T')[0];

        let score = 0;
        let method = 'fuzzy';

        // Signal A: ID Match (Perfect)
        if (cand.metadata?.external?.sofifa_id === scraped.sofifa_id) {
          return { match: cand, score: 1.0, method: 'id' };
        }

        // Signal B: Name Similarity (Jaro-Winkler) - 50% weight
        const nameScore = jaroWinkler(candNorm, scrapedNorm);
        score += nameScore * 0.5;

        // Signal C: DOB Match - 40% weight (golden key)
        if (scrapedDob && candDob && scrapedDob === candDob) {
          score += 0.4;
          method = 'dob_match';
        }

        // Signal D: Token Match (nickname/last name in DB title) - 10% weight
        const hasTokenMatch = scrapedTokens.some(t =>
          t.length > 2 && candNorm.includes(t)
        );
        if (hasTokenMatch) {
          score += 0.1;
        }

        // Also check reverse: DB tokens in scraped name (handles "Beto" case)
        const candTokens = candNorm.split(/\s+/);
        const hasReverseToken = candTokens.some(t =>
          t.length > 2 && scrapedNorm.includes(t)
        );
        if (hasReverseToken) {
          score += 0.05;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = cand;
          bestMethod = method;
        }
      }

      return { match: bestMatch, score: bestScore, method: bestMethod };
    };

    // 3. Iterate Players with Tiered Matching
    for (const scraped of players) {
      let match = null;
      let method = 'failed';
      let confidence = 0.0;

      // TIER 1: Search within club pool (20-30 players - fast!)
      if (clubPlayers.length > 0) {
        const result = findBestMatch(scraped, clubPlayers);
        if (result.score >= 0.55) {  // Lower threshold - club context provides confidence
          match = result.match;
          method = result.method;
          confidence = result.score;
        }
      }

      // TIER 2: Global search fallback (if club match failed)
      if (!match) {
        // Try normalized name search
        const normalizedName = normalizeName(scraped.name);

        // Search by any token of the name (handles "Beto" case)
        const tokens = normalizedName.split(/\s+/).filter(t => t.length > 2);
        const searchPattern = tokens.length > 0 ? `%${tokens[tokens.length - 1]}%` : `%${normalizedName}%`;

        const { data: globalCandidates } = await supabase
          .from('topics')
          .select('id, title, metadata')
          .eq('type', 'player')
          .ilike('title', searchPattern)
          .limit(15);

        if (globalCandidates && globalCandidates.length > 0) {
          const result = findBestMatch(scraped, globalCandidates);
          if (result.score >= 0.65) {  // Higher threshold for global
            match = result.match;
            method = `global_${result.method}`;
            confidence = result.score;
          }
        }
      }

      // TIER 3: DOB-only search (last resort for edge cases)
      if (!match && scraped.birth_date) {
        const { data: dobCandidates } = await supabase
          .from('topics')
          .select('id, title, metadata')
          .eq('type', 'player')
          .eq('metadata->>birth_date', scraped.birth_date)
          .limit(5);

        if (dobCandidates && dobCandidates.length > 0) {
          const result = findBestMatch(scraped, dobCandidates);
          if (result.score >= 0.5) {  // DOB already matched, just need some name signal
            match = result.match;
            method = `dob_search_${result.method}`;
            confidence = result.score;
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
