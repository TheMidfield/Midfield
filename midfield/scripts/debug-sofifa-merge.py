"""
DEBUG: Why did the merge fail?
Check exact column names and sample values
"""
import soccerdata as sd
import pandas as pd

sofifa = sd.SoFIFA(leagues="ENG-Premier League", versions="latest")

print("="*70)
print("DEBUG: Player Data Structure")
print("="*70)

# Get players
print("\n1️⃣ read_players():")
players = sofifa.read_players(team="Arsenal")
print(f"   Shape: {players.shape}")
print(f"   Index name: '{players.index.name}'")
print(f"   Columns: {list(players.columns)}")
print(f"\n   First 3 rows:")
print(players.head(3))

# Get ratings
print("\n" + "="*70)
print("2️⃣ read_player_ratings():")
ratings = sofifa.read_player_ratings(team="Arsenal")
print(f"   Shape: {ratings.shape}")
print(f"   Index name: '{ratings.index.name}'")
print(f"   Columns (first 5): {list(ratings.columns[:5])}")
print(f"\n   First 3 rows (first 5 cols):")
print(ratings.head(3)[ratings.columns[:5]])

# Check index values
print("\n" + "="*70)
print("3️⃣ Index Comparison:")
print(f"\n   players.index (first 5): {list(players.index[:5])}")
print(f"\n   ratings.index (first 5): {list(ratings.index[:5])}")

# Reset and check
print("\n" + "="*70)
print("4️⃣ After reset_index():")
players_reset = players.reset_index()
ratings_reset = ratings.reset_index()
print(f"\n   players_reset columns: {list(players_reset.columns)}")
print(f"   ratings_reset columns (first 5): {list(ratings_reset.columns[:5])}")

# Check for common column
common = set(players_reset.columns) & set(ratings_reset.columns)
print(f"\n   Common columns: {common}")

# Sample values
if 'player_id' in players_reset.columns:
    print(f"\n   players_reset['player_id'].head(3):")
    print(players_reset['player_id'].head(3))
    
if 'player' in players_reset.columns:
    print(f"\n   players_reset['player'].head(3):")
    print(players_reset['player'].head(3))
    
if 'player' in ratings_reset.columns:
    print(f"\n   ratings_reset['player'].head(3):")
    print(ratings_reset['player'].head(3))
