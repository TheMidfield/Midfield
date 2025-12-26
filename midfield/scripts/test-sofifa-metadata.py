"""
CRITICAL TEST: Get PLAYER METADATA + Ratings
The issue: read_player_ratings() only returns ratings, no names!
We need read_players() for metadata.
"""
import soccerdata as sd
import pandas as pd

print("="*70)
print("TESTING read_players() - Should have names and metadata!")
print("="*70)

sofifa = sd.SoFIFA(versions="latest")

# Use read_players() instead of read_player_ratings()
print("\nFetching Arsenal players (with metadata)...")
arsenal_players = sofifa.read_players(team="Arsenal")

print(f"\n✅ Retrieved {len(arsenal_players)} players")
print(f"✅ Total columns: {len(arsenal_players.columns)}\n")

print("="*70)
print("PLAYER NAME & ID COLUMNS:")
print("="*70)
# Look for name/ID columns
name_cols = [col for col in arsenal_players.columns if 'name' in col.lower() or 'id' in col.lower()]
for col in name_cols:
    example = arsenal_players[col].iloc[0] if len(arsenal_players) > 0 else "N/A"
    print(f"  {col:30} = {example}")

print("\n" + "="*70)
print("MATCHING FIELDS (Name, DOB, Nationality, Position):")
print("="*70)
key_cols = ['name', 'short_name', 'long_name', 'player_id', 'sofifa_id', 
            'dob', 'date_of_birth', 'nationality', 'position', 'player_positions']
for col in arsenal_players.columns:
    if any(key in col.lower() for key in ['name', 'birth', 'nationality', 'position', 'id']):
        example = arsenal_players[col].iloc[0] if len(arsenal_players) > 0 else "N/A"
        print(f"  {col:30} = {example}")

print("\n" + "="*70)
print("SAMPLE PLAYER (First 3 Arsenal players):")
print("="*70)
if len(arsenal_players) >= 3:
    for i in range(min(3, len(arsenal_players))):
        player = arsenal_players.iloc[i]
        # Print key fields only
        print(f"\nPlayer {i+1}:")
        for col in ['short_name', 'long_name', 'nationality', 'player_positions', 'overall', 'potential']:
            if col in arsenal_players.columns:
                print(f"  {col}: {player.get(col, 'N/A')}")
