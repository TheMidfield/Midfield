"""
SoFIFA API Quick Test - Python 3.11 Compatible
Run in venv with: python3.11 -m venv venv311 && source venv311/bin/activate && pip install soccerdata pandas
"""

import soccerdata as sd
import pandas as pd
import json

print("="*70)
print("SOFIFA API STRUCTURE TEST")
print("="*70)

# Initialize
sofifa = sd.SoFIFA(versions="latest")

# Test 1: Arsenal Squad (Known Team)
print("\n1️⃣ Testing Arsenal Squad Query...")
try:
    arsenal = sofifa.read_player_ratings(team="Arsenal")
    print(f"✅ Found {len(arsenal)} Arsenal players\n")
    
    # Find Bukayo Saka
    saka = arsenal[arsenal['short_name'].str.contains('Saka', case=False, na=False)]
    if len(saka) > 0:
        print("📊 Bukayo Saka Data Structure:")
        print(json.dumps(saka.iloc[0].to_dict(), indent=2, default=str))
        print("\n" + "="*70)
        
        # Document ALL available fields
        print("\n📋 All Available Fields:")
        for i, col in enumerate(arsenal.columns, 1):
            print(f"  {i}. {col}")
    else:
        print("❌ Saka not found")
        
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Name Matching Samples
print("\n\n2️⃣ Testing Name Formats (5 sample players)...")
try:
    sample_players = arsenal.head(5)
    print("\nName Format Analysis:")
    for _, player in sample_players.iterrows():
        print(f"  - short_name: '{player.get('short_name')}'")
        print(f"    full_name: '{player.get('long_name', 'N/A')}'")
        print(f"    nationality: '{player.get('nationality', 'N/A')}'")
        print(f"    DOB: '{player.get('date_of_birth', 'N/A')}'")
        print()
        
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Key Matching Fields
print("\n3️⃣ Testing Match-Critical Fields...")
try:
    test_player = arsenal.iloc[0]
    print("Fields for entity resolution:")
    print(f"  ✓ short_name: {test_player.get('short_name')}")
    print(f"  ✓ date_of_birth: {test_player.get('date_of_birth', 'MISSING')}")
    print(f"  ✓ nationality: {test_player.get('nationality', 'MISSING')}")
    print(f"  ✓ player_positions: {test_player.get('player_positions', 'MISSING')}")
    print(f"  ✓ team_position: {test_player.get('team_position', 'MISSING')}")
    print(f"  ✓ overall: {test_player.get('overall')}")
    print(f"  ✓ potential: {test_player.get('potential')}")
    
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "="*70)
print("TEST COMPLETE - Review output above")
print("="*70)
