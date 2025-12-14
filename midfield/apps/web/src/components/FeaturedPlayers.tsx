"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LayoutGrid, LayoutList, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Position Color Helper
const getPositionColor = (pos: string) => {
    const p = pos?.toLowerCase() || "";
    if (p.includes("goalkeeper")) return "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400";
    if (p.includes("defen") || p.includes("back")) return "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400";
    if (p.includes("midfield")) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400";
    if (p.includes("forward") || p.includes("wing") || p.includes("striker")) return "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400";
    return "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400";
};

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
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        icon={LayoutList}
                    >
                        List
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        icon={LayoutGrid}
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
                        const imageUrl = player.metadata?.photo_url;
                        const clubName = player.metadata?.club_name || "";
                        const positionColor = getPositionColor(position);

                        return (
                            <Link key={player.id} href={`/topic/${player.slug}`}>
                                <Card variant="interactive" className="p-3 flex items-center gap-3 group">
                                    {/* Player Photo - Smaller and more compact */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={player.title}
                                                    className="w-full h-full object-cover object-top scale-[1.2]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-neutral-600">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Rating Badge - Smaller */}
                                        <div className="absolute -bottom-0.5 -right-0.5 px-1 py-0.5 bg-slate-900 dark:bg-slate-100 rounded text-[10px] font-bold text-white dark:text-neutral-900">
                                            {rating}
                                        </div>
                                    </div>

                                    {/* Player Info - Compact layout */}
                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                                {player.title}
                                            </h3>
                                            {clubName && (
                                                <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500 dark:text-neutral-400">
                                                    <Shield className="w-3 h-3" />
                                                    <span className="font-medium truncate">{clubName}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Position Badge - Right aligned */}
                                        {position && (
                                            <Badge variant="secondary" className={`text-[9px] shrink-0 ${positionColor}`}>
                                                {position}
                                            </Badge>
                                        )}
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
                        const imageUrl = player.metadata?.photo_url;
                        const clubName = player.metadata?.club_name || "";
                        const positionColor = getPositionColor(position);

                        return (
                            <Link key={player.id} href={`/topic/${player.slug}`}>
                                {/* Rectangular card with aspect-ratio control */}
                                <Card variant="interactive" className="group p-4 flex flex-col">
                                    {/* Player Photo */}
                                    <div className="relative mb-3">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={player.title}
                                                    className="w-full h-full object-cover object-top scale-[1.2]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-neutral-600">
                                                    <User className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Rating Badge */}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900 dark:bg-slate-100 rounded text-[10px] font-bold text-white dark:text-neutral-900">
                                            {rating}
                                        </div>
                                    </div>

                                    {/* Player Name */}
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2 text-center min-h-[2.5rem]">
                                        {player.title}
                                    </h3>

                                    {/* Badges and Club Info */}
                                    <div className="flex flex-col items-center gap-2 mt-auto">
                                        {position && (
                                            <Badge variant="secondary" className={`text-[9px] ${positionColor}`}>
                                                {position}
                                            </Badge>
                                        )}
                                        {clubName && (
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-neutral-400 w-full justify-center">
                                                <Shield className="w-3 h-3 shrink-0" />
                                                <span className="font-medium truncate">{clubName}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
