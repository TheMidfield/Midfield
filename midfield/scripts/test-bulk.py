
import soccerdata as sd
import sys

def main():
    try:
        sofifa = sd.SoFIFA(leagues="ENG-Premier League", versions="latest")
        ids = [231866, 192985] # Rodri, De Bruyne
        print(f"Fetching ratings for IDs: {ids}")
        
        df = sofifa.read_player_ratings(player=ids)
        print("\nResult DataFrame:")
        print(df)
        print("\nIndex:")
        print(df.index)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
