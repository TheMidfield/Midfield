"""
SoFIFA API Deep Inspection - Check ALL columns
"""
import soccerdata as sd
import pandas as pd

print("Initializing...")
sofifa = sd.SoFIFA(versions="latest")

print("\nFetching Arsenal ratings...")
arsenal = sofifa.read_player_ratings(team="Arsenal")

print(f"\n✅ Retrieved {len(arsenal)} players")
print(f"✅ Total columns: {len(arsenal.columns)}\n")

print("="*70)
print("ALL AVAILABLE COLUMNS:")
print("="*70)
for i, col in enumerate(arsenal.columns, 1):
    # Show first value as example
    example = arsenal[col].iloc[0] if len(arsenal) > 0 else "N/A"
    print(f"{i:3}. {col:30} | Example: {example}")

print("\n" + "="*70)
print("SAMPLE ROW (First Player - ALL DATA):")
print("="*70)
if len(arsenal) > 0:
    first_player = arsenal.iloc[0]
    for col in arsenal.columns:
        print(f"{col:30} = {first_player[col]}")
