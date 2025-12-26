# SoFIFA API Test Plan

Since the `soccerdata` library has Python 3.13 compatibility issues, we'll use a **two-phase approach**:

## Phase 1: Manual API Investigation (Now)

Test the library in a controlled environment to understand:
1. **Exact data structure** returned by soccerdata
2. **Name formats** (e.g., "Bukayo Saka" vs "B. Saka")
3. **Available attributes** (overall, pace, shooting, etc.)
4. **Match keys** (player names, DOB, nationality fields)
5. **Team querying** behavior

## Phase 2: Docker Implementation (After understanding API)

Once we know exactly  how the API behaves, implement the Docker scraper.

---

## Test Questions to Answer

### 1. Name Format
- Does `short_name` match TheSportsDB format?
- Are accents preserved? (`João` vs `Joao`)
- Middle names included?

### 2. ID Fields
- Is there a `player_id` or `sofifa_id`?
- Can we use it for consistency across versions?

### 3. Date of Birth
- Is `date_of_birth` or similar field available?
- Format: `YYYY-MM-DD`?

### 4. Nationality
- Exact field name?
- Full country name or code?

### 5. Position
- Position format? (`ST`, `Forward`, `Striker`?)
- Multiple positions?

### 6. Attributes Available
```
- overall
- potential
- pace
- shooting
- passing
- dribbling
- defending
- physical (or physic?)
```

### 7. Team Querying
- Query by team name: `team="Arsenal"`?
- Case sensitive?
- Returns ALL players or limited?

---

## Next Steps

1. **Set up Python 3.11 virtual env** (avoid 3.13 issues)
2. **Run test script** on 5-10 known players
3. **Document exact field names** and formats
4. **Design matching algorithm** based on findings
5. **Build Docker scraper** with confidence

---

## Expected Findings

Based on preliminary research:
- `short_name` likely matches common names
- DOB available as `date_of_birth`
- Ratings: `overall`, `potential`, `pace`, etc.
- Team query should work

**But we need PROOF before committing to architecture.**
