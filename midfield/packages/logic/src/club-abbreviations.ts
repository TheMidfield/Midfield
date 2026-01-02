/**
 * Club Abbreviations Mapping
 * 
 * Centralized source of truth for club abbreviations used across the application.
 * These are standard 3-letter codes commonly used in football/soccer.
 */

export const CLUB_ABBREVIATIONS: Record<string, string> = {
    // English Premier League
    // English Premier League (2025-26)
    'afc-bournemouth': 'BOU',
    'bournemouth': 'BOU',
    'arsenal': 'ARS',
    'aston-villa': 'AVL',
    'brentford': 'BRE',
    'brighton-hove-albion': 'BHA',
    'brighton-and-hove-albion': 'BHA',
    'brighton': 'BHA',
    'burnley': 'BUR',
    'chelsea': 'CHE',
    'crystal-palace': 'CRY',
    'everton': 'EVE',
    'fulham': 'FUL',
    'leeds-united': 'LEE',
    'liverpool': 'LIV',
    'manchester-city': 'MCI',
    'manchester-united': 'MUN',
    'newcastle-united': 'NEW',
    'nottingham-forest': 'NFO',
    'sunderland': 'SUN',
    'tottenham-hotspur': 'TOT',
    'tottenham': 'TOT',
    'spurs': 'TOT',
    'west-ham-united': 'WHU',
    'west-ham': 'WHU',
    'wolverhampton-wanderers': 'WOL',
    'wolves': 'WOL',
    'leicester-city': 'LEI',
    'southampton': 'SOU',
    'watford': 'WAT',
    'norwich-city': 'NOR',
    'ipswich-town': 'IPS',

    // Spanish La Liga (2025-26)
    'alaves': 'ALA',
    'deportivo-alaves': 'ALA',
    'deportivo-alavs': 'ALA', // Alias
    'athletic-bilbao': 'ATH',
    'athletic-club': 'ATH',
    'atletico-madrid': 'ATM',
    'atltico-madrid': 'ATM', // Alias
    'barcelona': 'BAR',
    'fc-barcelona': 'BAR',
    'celta-vigo': 'CEL',
    'rc-celta': 'CEL',
    'elche': 'ELC',
    'espanyol': 'ESP',
    'getafe': 'GET',
    'getafe-cf': 'GET',
    'girona': 'GIR',
    'girona-fc': 'GIR',
    'levante': 'LEV',
    'osasuna': 'OSA',
    'rayo-vallecano': 'RAY',
    'mallorca': 'MLL',
    'rcd-mallorca': 'MLL',
    'real-betis': 'BET',
    'real-madrid': 'RMA',
    'real-oviedo': 'OVI',
    'real-sociedad': 'RSO',
    'sevilla': 'SEV',
    'sevilla-fc': 'SEV',
    'valencia': 'VAL',
    'valencia-cf': 'VAL',
    'villarreal': 'VIL',
    'villarreal-cf': 'VIL',
    'granada-cf': 'GRA',
    'las-palmas': 'LPA',
    'ud-las-palmas': 'LPA',
    'cadiz-cf': 'CAD',
    'ud-almeria': 'ALM',

    // Italian Serie A (2025-26)
    'ac-milan': 'MIL',
    'milan': 'MIL',
    'as-roma': 'ROM',
    'roma': 'ROM',
    'atalanta': 'ATA',
    'bologna': 'BOL',
    'bologna-fc': 'BOL',
    'cagliari': 'CAG',
    'cagliari-calcio': 'CAG',
    'como': 'COM',
    'como-1907': 'COM',
    'cremonese': 'CRE',
    'fiorentina': 'FIO',
    'acf-fiorentina': 'FIO',
    'genoa': 'GEN',
    'genoa-cfc': 'GEN',
    'hellas-verona': 'VER',
    'verona': 'VER',
    'inter-milan': 'INT',
    'internazionale': 'INT',
    'inter': 'INT',
    'fc-internazionale-milano': 'INT',
    'juventus': 'JUV',
    'lazio': 'LAZ',
    'ss-lazio': 'LAZ',
    'lecce': 'LEC',
    'us-lecce': 'LEC',
    'napoli': 'NAP',
    'ssc-napoli': 'NAP',
    'parma': 'PAR',
    'parma-calcio': 'PAR',
    'pisa': 'PIS',
    'sassuolo': 'SAS',
    'us-sassuolo': 'SAS',
    'torino': 'TOR',
    'torino-fc': 'TOR',
    'udinese': 'UDI',
    'empoli-fc': 'EMP',
    'ac-monza': 'MON',
    'us-salernitana': 'SAL',
    'spezia-calcio': 'SPE',
    'venezia-fc': 'VEN',
    'frosinone-calcio': 'FRO',

    // German Bundesliga (2025-26)
    'bayer-leverkusen': 'LEV',
    'bayer-04-leverkusen': 'LEV',
    'bayern-munich': 'FCB',
    'bayern-munchen': 'FCB',
    'fc-bayern-munich': 'FCB',
    'borussia-dortmund': 'BVB',
    'borussia-monchengladbach': 'BMG',
    'borussia-mgladbach': 'BMG',
    'eintracht-frankfurt': 'SGE',
    'fc-augsburg': 'FCA',
    'augsburg': 'FCA',
    'fc-koln': 'KOE',
    'koln': 'KOE',
    'cologne': 'KOE',
    'sc-freiburg': 'SCF',
    'freiburg': 'SCF',
    'hamburg-sv': 'HSV',
    'heidenheim': 'HDH',
    'fc-heidenheim': 'HDH',
    'hoffenheim': 'TSG',
    'tsg-hoffenheim': 'TSG',
    'mainz-05': 'M05',
    'fsv-mainz-05': 'M05',
    'mainz': 'M05',
    'rb-leipzig': 'RBL',
    'st-pauli': 'STP',
    'fc-st-pauli': 'STP',
    'union-berlin': 'FCU',
    'fc-union-berlin': 'FCU',
    'vfb-stuttgart': 'VFB',
    'stuttgart': 'VFB',
    'vfl-wolfsburg': 'WOB',
    'wolfsburg': 'WOB',
    'werder-bremen': 'SVW',
    'vfl-bochum': 'BOC',
    'holstein-kiel': 'KIE',

    // French Ligue 1 (2025-26)
    'angers-sco': 'SCO',
    'angers': 'SCO',
    'auxerre': 'AJA',
    'aj-auxerre': 'AJA',
    'brest': 'BRE',
    'stade-brestois': 'BRE',
    'le-havre': 'HAC',
    'le-havre-ac': 'HAC',
    'lille': 'LIL',
    'losc-lille': 'LIL',
    'lorient': 'FCL',
    'fc-lorient': 'FCL',
    'metz': 'MET',
    'fc-metz': 'MET',
    'monaco': 'ASM',
    'as-monaco': 'ASM',
    'nantes': 'NAN',
    'fc-nantes': 'NAN',
    'nice': 'NIC',
    'ogc-nice': 'NIC',
    'lyon': 'OL',
    'olympique-lyonnais': 'OL',
    'marseille': 'OM',
    'olympique-marseille': 'OM',
    'paris-fc': 'PAR',
    'paris-saint-germain': 'PSG',
    'psg': 'PSG',
    'paris-st-germain': 'PSG',
    'rc-lens': 'RCL',
    'lens': 'RCL',
    'rennes': 'REN',
    'stade-rennais': 'REN',
    'strasbourg': 'STR',
    'rc-strasbourg': 'STR',
    'toulouse': 'TFC',
    'toulouse-fc': 'TFC',
    'montpellier-hsc': 'MON',
    'stade-reims': 'REI',
    'as-saint-etienne': 'STE',

    // Other Notable European Clubs
    'ajax': 'AJA',
    'afc-ajax': 'AJA',
    'psv-eindhoven': 'PSV',
    'psv': 'PSV',
    'feyenoord': 'FEY',
    'benfica': 'BEN',
    'sl-benfica': 'BEN',
    'porto': 'POR',
    'fc-porto': 'POR',
    'sporting-cp': 'SCP',
    'sporting-lisbon': 'SCP',
    'sporting': 'SCP',
    'anderlecht': 'AND',
    'rsc-anderlecht': 'AND',
    'club-brugge': 'CLB',
    'celtic': 'CEL',
    'celtic-fc': 'CEL',
    'rangers': 'RAN',
    'rangers-fc': 'RAN',
    'galatasaray': 'GAL',
    'fenerbahce': 'FEN',
    'besiktas': 'BES',
    'shakhtar-donetsk': 'SHK',
    'dynamo-kyiv': 'DYN',
    'red-bull-salzburg': 'RBS',
    'fc-salzburg': 'RBS',
    'olympiacos': 'OLY',
    'panathinaikos': 'PAO',
    'crvena-zvezda': 'CZV',
    'dinamo-zagreb': 'DZG',
};

/**
 * Get club abbreviation by slug
 * Falls back to first 3 uppercase characters of title if not found
 */
export function getClubAbbreviation(slug: string, title?: string): string {
    if (!slug) return 'CLB';

    const normalized = slug.toLowerCase().trim();

    // 1. Exact match
    if (CLUB_ABBREVIATIONS[normalized]) {
        return CLUB_ABBREVIATIONS[normalized];
    }

    // 2. Try removing trailing ID (e.g. "manchester-city-133613" -> "manchester-city")
    // Regex: look for dash followed by digits at end of string
    const cleanSlug = normalized.replace(/-\d+$/, '');
    if (CLUB_ABBREVIATIONS[cleanSlug]) {
        return CLUB_ABBREVIATIONS[cleanSlug];
    }

    // 3. Fallback: first 3 chars of title in uppercase
    if (title) {
        return title.substring(0, 3).toUpperCase();
    }

    // 4. Last resort: first 3 chars of slug
    return slug.substring(0, 3).toUpperCase();
}
