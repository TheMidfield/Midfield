"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LayoutGrid, LayoutList, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// FIFA-style Position Standardization
const POSITION_MAPPING: Record<string, { abbr: string; full: string; color: string }> = {
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
const getPositionInfo = (pos: string) => {
    const normalized = pos?.toLowerCase().trim() || "";
    return POSITION_MAPPING[normalized] || {
        abbr: pos?.substring(0, 3).toUpperCase() || "DEF",
        full: pos || "Defender",
        color: "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400 border-slate-200 dark:border-neutral-700"
    };
};

// Centralized player image styling - USE THIS EVERYWHERE for consistency!
export const PLAYER_IMAGE_STYLE = {
    className: "w-full h-full object-cover scale-[1.3]",
    style: { objectPosition: 'top' as const, transform: 'translateY(15%)' }
} as const;

type ViewMode = "list" | "grid";

interface FeaturedPlayersProps {
    players: any[];
}

export function FeaturedPlayers({ players }: FeaturedPlayersProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                    <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    Featured Players
                </h2>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        icon={LayoutList}
                        className={viewMode === "list" ? '!bg-[#132019] !border-[#0D542B] !text-emerald-400 hover:!bg-[#1a2d24]' : ''}
                    >
                        List
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        icon={LayoutGrid}
                        className={viewMode === "grid" ? '!bg-[#132019] !border-[#0D542B] !text-emerald-400 hover:!bg-[#1a2d24]' : ''}
                    >
                        Grid
                    </Button>
                </div>
            </div>

            {/* List View - Default - Compact & Elegant */}
            {viewMode === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {players.map((player: any) => {
                        const rating = player.metadata?.rating || player.rating || "88";
                        const position = player.metadata?.position || "";
                        const positionInfo = getPositionInfo(position);
                        const imageUrl = player.metadata?.photo_url;
                        const clubName = player.clubInfo?.name || "";
                        const clubBadge = player.clubInfo?.badge_url || "";

                        return (
                            <Link key={player.id} href={`/topic/${player.slug}`}>
                                <Card variant="interactive" className="p-3 flex items-center gap-3 group relative">
                                    {/* Trending Rank - Top Right */}
                                    <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 dark:text-neutral-500">
                                        #{players.indexOf(player) + 1}
                                    </div>

                                    {/* Player Photo */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 group-hover:border-slate-400 dark:group-hover:border-neutral-500 transition-colors overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={player.title}
                                                    {...PLAYER_IMAGE_STYLE}
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-full bg-slate-300 dark:bg-neutral-600"
                                                    style={{
                                                        mask: "url('/player-silhouette.png') no-repeat center 8px",
                                                        WebkitMask: "url('/player-silhouette.png') no-repeat center 8px",
                                                        maskSize: "130%",
                                                        WebkitMaskSize: "130%"
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Player Info */}
                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate mb-1">
                                                {player.title}
                                            </h3>

                                            <div className="flex items-center gap-2">
                                                {/* Rating Badge */}
                                                <div className="px-1.5 py-0.5 bg-slate-900 dark:bg-slate-100 rounded text-[10px] font-bold text-white dark:text-neutral-900">
                                                    {rating}
                                                </div>

                                                {/* Position Badge - Next to Rating */}
                                                {position && (
                                                    <Badge variant="secondary" className={`text-[9px] ${positionInfo.color}`}>
                                                        {positionInfo.abbr}
                                                    </Badge>
                                                )}

                                                {/* Club Info - Same Row */}
                                                {clubName && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400">
                                                        {clubBadge ? (
                                                            <img src={clubBadge} alt={clubName} className="w-4 h-4 object-contain" />
                                                        ) : (
                                                            <Shield className="w-4 h-4" />
                                                        )}
                                                        <span className="font-semibold truncate">{clubName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Grid View - Rectangular Portrait Cards */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {players.map((player: any) => {
                        const rating = player.metadata?.rating || player.rating || "88";
                        const position = player.metadata?.position || "";
                        const positionInfo = getPositionInfo(position);
                        const imageUrl = player.metadata?.photo_url;
                        const clubName = player.clubInfo?.name || "";
                        const clubBadge = player.clubInfo?.badge_url || "";

                        return (
                            <Link key={player.id} href={`/topic/${player.slug}`}>
                                <Card variant="interactive" className="group p-3 flex flex-col relative">
                                    {/* Trending Rank - Top Right */}
                                    <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 dark:text-neutral-500">
                                        #{players.indexOf(player) + 1}
                                    </div>

                                    {/* Top: Horizontal Layout - Photo + Info */}
                                    <div className="flex items-start gap-3 mb-3">
                                        {/* Player Photo - Left */}
                                        <div className="relative shrink-0">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 group-hover:border-slate-400 dark:group-hover:border-neutral-500 transition-colors overflow-hidden">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={player.title}
                                                        {...PLAYER_IMAGE_STYLE}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-full h-full bg-slate-300 dark:bg-neutral-600"
                                                        style={{
                                                            mask: "url('/player-silhouette.png') no-repeat center 8px",
                                                            WebkitMask: "url('/player-silhouette.png') no-repeat center 8px",
                                                            maskSize: "130%",
                                                            WebkitMaskSize: "130%"
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Column - Right */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {/* Rating Badge */}
                                                <div className="inline-block px-1.5 py-0.5 bg-slate-900 dark:bg-slate-100 rounded text-[9px] font-bold text-white dark:text-neutral-900">
                                                    {rating}
                                                </div>

                                                {/* Position Badge - Next to Rating, Same Size */}
                                                {position && (
                                                    <Badge variant="secondary" className={`text-[9px] ${positionInfo.color}`}>
                                                        {positionInfo.abbr}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Player Name - Full width */}
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2 leading-tight">
                                        {player.title}
                                    </h3>

                                    {/* Club Info - Bottom */}
                                    {clubName && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400 mt-auto">
                                            {clubBadge ? (
                                                <img src={clubBadge} alt={clubName} className="w-4 h-4 object-contain shrink-0" />
                                            ) : (
                                                <Shield className="w-4 h-4 shrink-0" />
                                            )}
                                            <span className="font-semibold truncate">{clubName}</span>
                                        </div>
                                    )}
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
