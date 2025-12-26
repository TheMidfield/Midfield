"""
Test script for fetching FIFA 26 (FC 26) ratings using soccerdata library
This will verify if we can successfully fetch player ratings and attributes from SoFifa
"""

try:
    import soccerdata as sd
    import pandas as pd
    print("✅ soccerdata library imported successfully")
except ImportError:
    print("❌ soccerdata not installed. Install with: pip install soccerdata")
    exit(1)

print("\n" + "="*70)
print("TESTING SOFIFA INTEGRATION FOR FC 26 RATINGS")
print("="*70 + "\n")

# Initialize SoFIFA client
print("Initializing SoFIFA client...")
sofifa = sd.SoFIFA(versions="latest")  # Get latest FIFA/FC version
print("✅ Client initialized\n")

# Test 1: Fetch Arsenal player ratings (Bukayo Saka should be there)
print("Test 1: Fetching Arsenal player ratings...")
try:
    arsenal_ratings = sofifa.read_player_ratings(team="Arsenal")
    print(f"✅ Found {len(arsenal_ratings)} Arsenal players")
    print("\nSample players:")
    print(arsenal_ratings[['short_name', 'overall', 'potential']].head(10))
    
    # Check if Saka is in the data
    if 'saka' in arsenal_ratings['short_name'].str.lower().values:
        saka = arsenal_ratings[arsenal_ratings['short_name'].str.lower().str.contains('saka')].iloc[0]
        print(f"\n🎯 Found Bukayo Saka!")
        print(f"   Overall: {saka['overall']}")
        print(f"   Potential: {saka['potential']}")
except Exception as e:
    print(f"❌ Error fetching Arsenal ratings: {e}")

# Test 2: Fetch Liverpool player ratings (Mo Salah)
print("\n" + "="*70)
print("Test 2: Fetching Liverpool player ratings...")
try:
    liverpool_ratings = sofifa.read_player_ratings(team="Liverpool")
    print(f"✅ Found {len(liverpool_ratings)} Liverpool players")
    
    if 'salah' in liverpool_ratings['short_name'].str.lower().values:
        salah = liverpool_ratings[liverpool_ratings['short_name'].str.lower().str.contains('salah')].iloc[0]
        print(f"\n🎯 Found Mo Salah!")
        print(f"   Overall: {salah['overall']}")
        print(f"   Potential: {salah['potential']}")
except Exception as e:
    print(f"❌ Error fetching Liverpool ratings: {e}")

# Test 3: Check available columns (what attributes can we get?)
print("\n" + "="*70)
print("Test 3: Available attributes/columns...")
try:
    print(f"\nTotal columns: {len(arsenal_ratings.columns)}")
    print("\nAll available columns:")
    for i, col in enumerate(arsenal_ratings.columns, 1):
        print(f"  {i}. {col}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 4: Get detailed player data (with all attributes)
print("\n" + "="*70)
print("Test 4: Fetching detailed player data...")
try:
    arsenal_players = sofifa.read_players(team="Arsenal")
    print(f"✅ Found {len(arsenal_players)} Arsenal players with full details")
    print(f"\nColumns in detailed data: {len(arsenal_players.columns)}")
    
    # Show a sample player's key attributes
    if len(arsenal_players) > 0:
        sample = arsenal_players.iloc[0]
        print(f"\nSample player: {sample.get('short_name', 'Unknown')}")
        print(f"  Overall: {sample.get('overall', 'N/A')}")
        print(f"  Pace: {sample.get('pace', 'N/A')}")
        print(f"  Shooting: {sample.get('shooting', 'N/A')}")
        print(f"  Passing: {sample.get('passing', 'N/A')}")
        print(f"  Dribbling: {sample.get('dribbling', 'N/A')}")
        print(f"  Defending: {sample.get('defending', 'N/A')}")
        print(f"  Physical: {sample.get('physic', 'N/A')}")
except Exception as e:
    print(f"❌ Error fetching detailed player data: {e}")

print("\n" + "="*70)
print("TESTS COMPLETE")
print("="*70)
