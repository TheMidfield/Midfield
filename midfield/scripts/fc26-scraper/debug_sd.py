import soccerdata as sd
import pandas as pd
import cloudscraper
import requests

# Patch session
def patched_session(*args, **kwargs):
    return cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'darwin', 'desktop': True})
requests.Session = patched_session

def main():
    print("Initializing SoFIFA...")
    # Just read one league to be fast
    sofifa = sd.SoFIFA(leagues="ENG-Premier League", versions="latest")
    
    print("Reading players list...")
    df = sofifa.read_players()
    
    print("\nCOLUMNS FOUND:")
    print(df.columns.tolist())
    
    print("\nSAMPLE ROW:")
    if not df.empty:
        print(df.iloc[0].to_dict())
    else:
        print("No players found.")

if __name__ == "__main__":
    main()
