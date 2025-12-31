"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { Shield, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface RecentResult {
    id: number;
    date: string;
    home_team: {
        id: string;
        title: string;
        slug: string;
        metadata?: { badge_url?: string };
    };
    away_team: {
        id: string;
        title: string;
        slug: string;
        metadata?: { badge_url?: string };
    };
    competition: {
        title: string;
        slug: string;
    };
    home_score: number;
    away_score: number;
    status: string;
}

async function fetchRecentResults(): Promise<RecentResult[]> {
    const response = await fetch('/api/recent-results');
    if (!response.ok) return [];
    return response.json();
}

export function RecentResultsWidget() {
    const [results, setResults] = useState<RecentResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentResults()
            .then(setResults)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base font-semibold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Recent Results
                    </h3>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-neutral-800 rounded-md animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    if (results.length === 0) {
        return (
            <Card className="p-4">
                <h3 className="font-display text-base font-semibold flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Recent Results
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-500 text-center py-4">
                    No recent results available
                </p>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-base font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Recent Results
                </h3>
            </div>

            <div className="space-y-2">
                {results.map(result => {
                    const homeWin = result.home_score > result.away_score;
                    const awayWin = result.away_score > result.home_score;
                    const draw = result.home_score === result.away_score;

                    return (
                        <div
                            key={result.id}
                            className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-700/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                        >
                            {/* Home Team */}
                            <Link
                                href={`/topic/${result.home_team.slug}`}
                                className="flex items-center gap-1.5 flex-1 min-w-0 hover:opacity-70 transition-opacity"
                            >
                                <div className="relative w-5 h-5 shrink-0">
                                    {result.home_team.metadata?.badge_url ? (
                                        <NextImage
                                            src={result.home_team.metadata.badge_url}
                                            alt={result.home_team.title}
                                            fill
                                            className="object-contain"
                                            sizes="20px"
                                        />
                                    ) : (
                                        <Shield className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                                    )}
                                </div>
                                <span className={`text-xs font-semibold truncate ${homeWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-neutral-400'}`}>
                                    {result.home_team.title}
                                </span>
                            </Link>

                            {/* Score */}
                            <div className="shrink-0 px-2 py-0.5 bg-white dark:bg-neutral-900 rounded border border-slate-200 dark:border-neutral-700">
                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-neutral-100">
                                    {result.home_score}-{result.away_score}
                                </span>
                            </div>

                            {/* Away Team */}
                            <Link
                                href={`/topic/${result.away_team.slug}`}
                                className="flex items-center gap-1.5 flex-1 min-w-0 justify-end hover:opacity-70 transition-opacity"
                            >
                                <span className={`text-xs font-semibold truncate text-right ${awayWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-neutral-400'}`}>
                                    {result.away_team.title}
                                </span>
                                <div className="relative w-5 h-5 shrink-0">
                                    {result.away_team.metadata?.badge_url ? (
                                        <NextImage
                                            src={result.away_team.metadata.badge_url}
                                            alt={result.away_team.title}
                                            fill
                                            className="object-contain"
                                            sizes="20px"
                                        />
                                    ) : (
                                        <Shield className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                                    )}
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <p className="text-[10px] text-slate-400 dark:text-neutral-500 text-center">
                    Latest completed matches from top leagues
                </p>
            </div>
        </Card>
    );
}
