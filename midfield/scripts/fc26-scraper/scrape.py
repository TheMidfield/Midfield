import soccerdata as sd
import pandas as pd
import json
import time
import requests
import os
import sys

# Configuration
EDGE_FUNCTION_URL = os.environ.get("SUPABASE_URL", "") + "/functions/v1/sync-ratings"
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

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
        }
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

    # Approach: Iterate known teams or just get ALL players and group by team
    print("\n📚 Fetching player list for ALL leagues...")
    all_players = sofifa.read_players()
    
    # Group by team
    teams_list = all_players['team'].unique()
    print(f"✅ Found {len(all_players)} players in {len(teams_list)} teams")
    
    for team_name in teams_list:
        print(f"\n⚽ Team: {team_name}")
        team_players = all_players[all_players['team'] == team_name]
        
        batch_data = []
        
        for player_id, meta in team_players.iterrows():
            try:
                # Polite delay
                time.sleep(0.5) 
                
                # Fetch ratings
                rating_df = sofifa.read_player_ratings(player=player_id)
                cleaned = clean_player_data(meta, rating_df, player_id)
                
                if cleaned:
                    batch_data.append(cleaned)
                    print(f"   • {cleaned['name']} ({cleaned['overall']})")
                
            except Exception as e:
                print(f"   ❌ Error fetching {meta['player']}: {e}")
        
        # Push batch to Edge Function
        if batch_data:
            push_to_edge_function(team_name, batch_data)
            
        # Larger delay between teams
        time.sleep(2)

if __name__ == "__main__":
    main()
