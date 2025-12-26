"""
COMBINED TEST: Players + Ratings
Key insight from docs:
- read_players() → player_id (index), player (name), team, league
- read_player_ratings() → player (name as index), all ratings
- We need BOTH and merge on player name!
"""
import soccerdata as sd
import pandas as pd

print("="*70)
print("SOFIFA COMPLETE DATA TEST")
print("="*70)

sofifa = sd.SoFIFA(leagues="ENG-Premier League", versions="latest")

# Step 1: Get player metadata (names, IDs)
print("\n1️⃣ Fetching Arsenal players (metadata)...")
players = sofifa.read_players(team="Arsenal")
print(f"✅ {len(players)} players with metadata")
print(f"   Columns: {list(players.columns)}")
print(f"   Index name: {players.index.name}")

# Step 2: Get player ratings
print("\n2️⃣ Fetching Arsenal ratings...")
ratings = sofifa.read_player_ratings(team="Arsenal")
print(f"✅ {len(ratings)} players with ratings")
print(f"   Columns (first 10): {list(ratings.columns[:10])}")
print(f"   Index name: {ratings.index.name}")

# Step 3: Merge them
print("\n3️⃣ Merging data...")
# Reset index to make player_id a column
players_reset = players.reset_index()
ratings_reset = ratings.reset_index()

# Merge on 'player' (name)
combined = pd.merge(
    players_reset, 
    ratings_reset, 
    on='player',
    how='inner'
)
print(f"✅ Merged: {len(combined)} players with complete data")

print("\n" + "="*70)
print("SAMPLE: Bukayo Saka (complete data)")
print("="*70)
saka = combined[combined['player'].str.contains('Saka', case=False, na=False)]
if len(saka) > 0:
    s = saka.iloc[0]
    print(f"Player ID (SoFIFA): {s['player_id']}")
    print(f"Name: {s['player']}")
    print(f"Team: {s['team']}")
    print(f"League: {s['league']}")
    print(f"Overall: {s['overallrating']}")
    print(f"Potential: {s['potential']}")
    print(f"Pace (accel): {s['acceleration']}")
    print(f"Pace (sprint): {s['sprintspeed']}")
    print(f"Shooting (finishing): {s['finishing']}")
    print(f"Dribbling: {s['dribbling']}")

print("\n" + "="*70)
print("TOP 5 ARSENAL PLAYERS (for matching)")
print("="*70)
for _, player in combined.head(5).iterrows():
    print(f"{player['player_id']:7} | {player['player']:30} | Overall: {player['overallrating']}")

print("\n✅ SUCCESS! We can now:")
print("  1. Use player_id as SoFIFA canonical ID")
print("  2. Match by player name (fuzzy matching needed)")
print("  3. Store all rating attributes")
