// =============================================================================
// ENTITY HELPERS - Centralized logic for entity display consistency
// =============================================================================

// FIFA-style Position Standardization
export const POSITION_MAPPING: Record<string, { abbr: string; full: string; color: string }> = {
    // Goalkeepers - Red/Orange
    "goalkeeper": { abbr: "GK", full: "Goalkeeper", color: "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900" },
    "gk": { abbr: "GK", full: "Goalkeeper", color: "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900" },

    // Defenders - Yellow
    "centre-back": { abbr: "CB", full: "Centre-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "center-back": { abbr: "CB", full: "Centre-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "central defender": { abbr: "CB", full: "Centre-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "cb": { abbr: "CB", full: "Centre-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "defender": { abbr: "CB", full: "Centre-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },

    "left-back": { abbr: "LB", full: "Left-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "lb": { abbr: "LB", full: "Left-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },

    "right-back": { abbr: "RB", full: "Right-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "rb": { abbr: "RB", full: "Right-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },

    "left wing-back": { abbr: "LWB", full: "Left Wing-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "lwb": { abbr: "LWB", full: "Left Wing-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },

    "right wing-back": { abbr: "RWB", full: "Right Wing-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
    "rwb": { abbr: "RWB", full: "Right Wing-Back", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },

    // Midfielders - Green
    "defensive midfield": { abbr: "CDM", full: "Defensive Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "defensive midfielder": { abbr: "CDM", full: "Defensive Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "cdm": { abbr: "CDM", full: "Defensive Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "dm": { abbr: "CDM", full: "Defensive Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },

    "central midfield": { abbr: "CM", full: "Central Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "centre midfield": { abbr: "CM", full: "Central Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "midfielder": { abbr: "CM", full: "Central Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "cm": { abbr: "CM", full: "Central Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "midfield": { abbr: "CM", full: "Central Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },

    "attacking midfield": { abbr: "CAM", full: "Attacking Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "attacking midfielder": { abbr: "CAM", full: "Attacking Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "cam": { abbr: "CAM", full: "Attacking Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "am": { abbr: "CAM", full: "Attacking Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },

    "left midfield": { abbr: "LM", full: "Left Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "lm": { abbr: "LM", full: "Left Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },

    "right midfield": { abbr: "RM", full: "Right Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    "rm": { abbr: "RM", full: "Right Midfielder", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },

    // Attackers/Forwards - Blue
    "left winger": { abbr: "LW", full: "Left Winger", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "left wing": { abbr: "LW", full: "Left Winger", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "lw": { abbr: "LW", full: "Left Winger", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },

    "right winger": { abbr: "RW", full: "Right Winger", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "right wing": { abbr: "RW", full: "Right Winger", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "rw": { abbr: "RW", full: "Right Winger", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },

    "striker": { abbr: "ST", full: "Striker", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "st": { abbr: "ST", full: "Striker", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "forward": { abbr: "ST", full: "Striker", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "attack": { abbr: "ST", full: "Striker", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },

    "centre-forward": { abbr: "CF", full: "Centre-Forward", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "center-forward": { abbr: "CF", full: "Centre-Forward", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
    "cf": { abbr: "CF", full: "Centre-Forward", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
};

// Get standardized position info
export const getPositionInfo = (pos: string) => {
    const normalized = pos?.toLowerCase().trim() || "";
    // Check direct mapping first
    if (POSITION_MAPPING[normalized]) return POSITION_MAPPING[normalized];

    // Fallbacks for managers, etc.
    if (normalized.includes("manager") || normalized.includes("coach"))
        return { abbr: "MGR", full: "Manager", color: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900" };

    return {
        abbr: pos?.substring(0, 3).toUpperCase() || "UNK",
        full: pos || "Unknown",
        color: "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400 border-slate-200 dark:border-neutral-700"
    };
};

// Centralized player image styling
export const PLAYER_IMAGE_STYLE = {
    className: "object-cover scale-[1.3] grayscale-[0.1] group-hover:grayscale-0 transition-all duration-500",
    style: { objectPosition: 'top' as const, transform: 'translateY(15%)' }
} as const;

// Rating color helper
export const getRatingColor = (rating: number | string) => {
    const numRating = typeof rating === 'number' ? rating : parseInt(String(rating), 10);
    if (isNaN(numRating)) return 'text-slate-500 dark:text-neutral-500';

    if (numRating >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (numRating >= 70) return 'text-emerald-700/80 dark:text-emerald-600';
    if (numRating >= 60) return 'text-yellow-600 dark:text-yellow-500';
    if (numRating >= 50) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-600 dark:text-red-500';
};

// Rating background color helper (for progress bars)
export const getRatingBgColor = (rating: number | string) => {
    const numRating = typeof rating === 'number' ? rating : parseInt(String(rating), 10);
    if (isNaN(numRating)) return 'bg-slate-500 dark:bg-neutral-500';

    if (numRating >= 90) return 'bg-emerald-500';
    if (numRating >= 80) return 'bg-emerald-600';
    if (numRating >= 70) return 'bg-emerald-700/80';
    if (numRating >= 60) return 'bg-yellow-500';
    if (numRating >= 50) return 'bg-orange-500';
    return 'bg-red-500';
};
