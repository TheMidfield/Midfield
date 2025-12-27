"""
SMART TEST SCRAPER
Goal: Validate we can fetch ALL 38+ attributes for a few players.
This is a 'Gentle Scraper' prototype (fetches by ID).
"""
import soccerdata as sd
import pandas as pd
import json
import time

# Function to convert dataframe row to clean dict
def clean_player_data(player_meta, ratings_df, sofifa_id):
    if ratings_df.empty:
        return None
        
    ratings = ratings_df.iloc[0]
    
    # Structure the data comprehensively
    return {
        "id": str(sofifa_id),
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

print("="*60)
print("🚀 STARTING SMART TEST SCRAPER")
print("Target: Arsenal (First 3 players only)")
print("="*60)

sofifa = sd.SoFIFA(leagues="ENG-Premier League", versions="latest")

# 1. Get Team Roster
print("\n📋 Fetching Arsenal roster...")
roster = sofifa.read_players(team="Arsenal")
print(f"✅ Found {len(roster)} players")

# 2. Gentle Loop (First 3 players)
results = []
sample_size = 3

for i, (player_id, meta) in enumerate(roster.head(sample_size).iterrows()):
    print(f"\n[{i+1}/{sample_size}] Fetching ratings for {meta['player']} (ID: {player_id})...")
    
    try:
        # Fetch individual ratings
        rating_df = sofifa.read_player_ratings(player=player_id)
        
        # Clean and structure
        player_clean = clean_player_data(meta, rating_df, player_id)
        
        if player_clean:
            results.append(player_clean)
            print(f"   ✅ Success! Overall: {player_clean['overall']}")
        else:
            print("   ❌ No ratings found")
            
        # Polite sleep
        time.sleep(1)
        
    except Exception as e:
        print(f"   ❌ Error: {e}")

# 3. Output results
print("\n" + "="*60)
print("📊 TEST RESULTS")
print("="*60)

if results:
    # Print first player in full to verify depth
    print(f"\nFirst Player Full Data ({results[0]['name']}):")
    print(json.dumps(results[0], indent=2))
    
    # Save to file checks
    with open('fc26_test_sample.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\n✅ Saved sample to fc26_test_sample.json")
else:
    print("\n❌ No data collected")
