"""
WORKAROUND: Fetch ratings per player ID
Since read_player_ratings(team="Arsenal") only returns 1 player,
we'll fetch each player individually using their player_id
"""
import soccerdata as sd
import pandas as pd

sofifa = sd.SoFIFA(leagues="ENG-Premier League", versions="latest")

print("="*70)
print("WORKAROUND: Individual Player Rating Fetch")
print("="*70)

# Step 1: Get all Arsenal players
print("\n1️⃣ Getting Arsenal players...")
players = sofifa.read_players(team="Arsenal")
print(f"✅ Found {len(players)} players")

# Step 2: Fetch ratings for each player by ID
print("\n2️⃣ Fetching ratings individually (first 5 only for test)...")
all_ratings = []

for i, (player_id, player_data) in enumerate(players.head(5).iterrows()):
    print(f"   [{i+1}/5] {player_data['player']}...", end=" ")
    try:
        # Fetch rating by player ID
        rating = sofifa.read_player_ratings(player=player_id)
        if len(rating) > 0:
            # Add player_id to the rating data
            rating_dict = rating.iloc[0].to_dict()
            rating_dict['player_id'] = player_id
            rating_dict['player_name'] = player_data['player']
            all_ratings.append(rating_dict)
            print(f"✅ Overall: {rating_dict.get('overallrating', 'N/A')}")
        else:
            print("❌ No data")
    except Exception as e:
        print(f"❌ Error: {e}")

# Step 3: Create combined dataframe
if all_ratings:
    combined_df = pd.DataFrame(all_ratings)
    print(f"\n✅ Successfully fetched {len(combined_df)} player ratings")
    
    print("\n" + "="*70)
    print("SAMPLE DATA (First 3 players):")
    print("="*70)
    for _, player in combined_df.head(3).iterrows():
        print(f"\n{player['player_name']}")
        print(f"  SoFIFA ID: {player['player_id']}")
        print(f"  Overall: {player.get('overallrating', 'N/A')}")
        print(f"  Potential: {player.get('potential', 'N/A')}")
        print(f"  Pace: {player.get('acceleration', 'N/A')}/{player.get('sprintspeed', 'N/A')}")
        print(f"  Shooting: {player.get('finishing', 'N/A')}")
        print(f"  Dribbling: {player.get('dribbling', 'N/A')}")
else:
    print("\n❌ No ratings fetched")

print("\n" + "="*70)
print("THIS IS THE APPROACH FOR THE FINAL SCRAPER!")
print("="*70)
