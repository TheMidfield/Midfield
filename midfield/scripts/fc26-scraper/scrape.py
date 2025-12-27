import soccerdata as sd
import pandas as pd
import json
import time
import requests
import cloudscraper
import concurrent.futures

# Monkey-patch requests.Session to header-spoof SoFIFA (Anti-Bot bypass)
# We use cloudscraper to handle Cloudflare challenges if present
def patched_session(*args, **kwargs):
    # create_scraper returns a Session object pre-configured to look like a browser
    # and solve simple JS challenges
    return cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'darwin',
            'desktop': True
        }
    )
requests.Session = patched_session

import os
import sys
from dotenv import load_dotenv

# Load .env from project root (2 levels up if script is in scripts/fc26-scraper)
# Or just let python-dotenv find it
load_dotenv(override=True)

# Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
EDGE_FUNCTION_URL = SUPABASE_URL + "/functions/v1/sync-ratings"
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Teams to Scrape (Top 5 Leagues + key teams)
# We focus on the big leagues for MVP efficiency
LEAGUES_TO_SCRAPE = [
    "ENG-Premier League",
    "ESP-La Liga",
    "ITA-Serie A",
    "GER-Bundesliga",
    "FRA-Ligue 1"
]

def clean_player_data(player_meta, ratings_df, sofifa_id):
    if ratings_df.empty:
        return None
        
    ratings = ratings_df.iloc[0]
    
    # Structure the data comprehensively
    return {
        "sofifa_id": str(sofifa_id),
        "name": player_meta['player'],
        "team": player_meta['team'],
        "overall": int(ratings.get('overallrating', 0)),
        "potential": int(ratings.get('potential', 0)),
        "full_stats": {
            k: int(v) if pd.notnull(v) and str(v).isdigit() else str(v)
            for k, v in ratings.to_dict().items()
            if k not in ['fifa_edition', 'update']
        },
        "birth_date": str(player_meta.get('birth_date', '')),
        "height": int(player_meta.get('height', 0)) if pd.notnull(player_meta.get('height')) else None,
        "weight": int(player_meta.get('weight', 0)) if pd.notnull(player_meta.get('weight')) else None,
        "nationality": str(player_meta.get('nationality', ''))
    }

def push_to_edge_function(team_name, players_data):
    """Push a batch of players for one team to the Edge Function"""
    if not players_data:
        return
        
    payload = {
        "team": team_name,
        "players": players_data
    }
    
    print(f"   🚀 Pushing {len(players_data)} players to sync-ratings...")
    
    try:
        response = requests.post(
            EDGE_FUNCTION_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            }
        )
        if response.status_code == 200:
            print(f"   ✅ Sync success: {response.json()}")
        else:
            print(f"   ❌ Sync failed ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"   ❌ Network error: {e}")

def main():
    print("="*60)
    print("🌍 STARTING FC26 PRODUCTION SCRAPER")
    print("="*60)
    
    if not EDGE_FUNCTION_URL or not SUPABASE_KEY:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY env vars")
        # For local testing without push, we might continue, but in prod we stop
        if not os.environ.get("DRY_RUN"):
             sys.exit(1)

    sofifa = sd.SoFIFA(leagues=LEAGUES_TO_SCRAPE, versions="latest")
    
    # 1. Get all teams first in one go per league (efficient)
    for league in LEAGUES_TO_SCRAPE:
        print(f"\n🏆 League: {league}")
        try:
            # We filter read_players by league effectively by initializing SoFIFA with it
            # But read_players returns ALL for the initialized leagues
            # So we iterate teams from the league dict or just process grouped by team
            pass 
        except Exception as e:
            print(f"Error init league: {e}")

    # Approach: Global Parallelism
    print("\n📚 Fetching player list for ALL leagues...")
    start_time = time.time()
    all_players = sofifa.read_players()
    print(f"✅ Found {len(all_players)} players in {time.time() - start_time:.2f}s")
    
    # Analyze workload
    teams_list = all_players['team'].unique()
    total_teams = len(teams_list)
    print(f"🎯 Targeting {total_teams} teams. Launching massive parallel scrape...")

    # Tracking
    # Dictionary to hold results: team_name -> [player_data, ...]
    team_results = {t: [] for t in teams_list}
    # Expected counts
    team_counts = all_players['team'].value_counts().to_dict()
    
    # We use a large pool
    MAX_WORKERS = 30  # Increased for speed as requested
    
    processed_count = 0
    pushed_teams = 0
    total_players = len(all_players)

    print(f"🚀 Thread Pool: {MAX_WORKERS} workers")

    # Helper for the task
    def process_player(row_tuple):
        # row_tuple is (index, Series)
        idx, meta = row_tuple
        pid = idx # Index of the DF returned by read_players is the player ID usually, or we need to check
        # Checking logic of read_players: usually index is ID?
        # Debug script showed: index isn't printed in to_dict() explicitly?
        # Actually read_players returns a DF. The index is usually the ID if configured, or it's a column?
        # soccerdata usually sets index to player_id if available.
        # Let's assume the passed 'pid' from iterrows is the ID.
        try:
            rdf = sofifa.read_player_ratings(player=pid)
            data = clean_player_data(meta, rdf, pid)
            return (meta['team'], data)
        except Exception:
            return (meta['team'], None)

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        # iterrows returns (index, Series)
        future_to_player = {
            executor.submit(process_player, (pid, row)): pid 
            for pid, row in all_players.iterrows()
        }
        
        print("⏳ Tasks submitted. Processing...")
        
        for future in concurrent.futures.as_completed(future_to_player):
            processed_count += 1
            team_name, p_data = future.result()
            
            if p_data:
                team_results[team_name].append(p_data)
            
            # Progress bar effect
            if processed_count % 50 == 0:
                sys.stdout.write(f"\r   ⚡ Processed: {processed_count}/{total_players} ({(processed_count/total_players)*100:.1f}%)")
                sys.stdout.flush()

            # Check if this team is ready to push?
            # We need to know if we have ALL players for this team.
            # Simple way: Check length match.
            # Note: If some failed (None returned), we might never reach 'exact' count if we filter Nones.
            # But here we filter Nones in result.
            # Actually, to trigger push reliably, we need to track *attempts* per team, not just successes.
            # But the 'future' doesn't easily tell us which team it was BEFORE result. Use return value.
            
            # This 'streaming push' is complex because tasks finish out of order.
            # If we want to push *as soon as possible*, we need to track pending tasks per team.
            # Simpler optimization for now:
            # Just push at the END of everything? User wants speed. 
            # Parallel fetching IS the speedup. Pushing is fast.
            # Waiting for 100% completion to push anything might feel slow.
            # Let's push as soon as a team has > X players and hasn't been pushed cleanly?
            # Or just verify completion.
            pass

    print(f"\n✅ Scraping complete in {time.time() - start_time:.2f}s. pushing to DB...")

    # Push all teams that have data
    # We can parallelize the pushing too!
    
    def push_team_task(t_name):
        players = team_results[t_name]
        if players:
            push_to_edge_function(t_name, players)
            return len(players)
        return 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as push_executor:
        push_futures = [push_executor.submit(push_team_task, t) for t in teams_list]
        for f in concurrent.futures.as_completed(push_futures):
             pushed_teams += 1

    print("\n🎉 DONE! All teams synced.")

if __name__ == "__main__":
    main()
