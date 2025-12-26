
"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ClubFixturesProps {
    clubId: string;
    fixtures: any[];
}

export function ClubFixtures({ clubId, fixtures }: ClubFixturesProps) {
    if (!fixtures || fixtures.length === 0) {
        return (
            <div className="text-center py-6 text-slate-500 dark:text-neutral-500 text-sm">
                No fixtures available.
            </div>
        );
    }

    // Split into Upcoming vs Results
    const now = new Date();
    // Fixtures are sorted ASC by date.
    // Results: Date < Now (reversed to show most recent first)
    // Upcoming: Date >= Now

    const results = fixtures
        .filter(f => new Date(f.date) < now)
        .reverse();

    const upcoming = fixtures
        .filter(f => new Date(f.date) >= now);

    const FixtureItem = ({ fixture }: { fixture: any }) => {
        const isHome = fixture.home_team_id === clubId;
        const opponent = isHome ? fixture.away_team : fixture.home_team;
        const date = new Date(fixture.date);

        // Format date: "Sat, 28 Dec"
        const dateStr = date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

        // Format time: "15:00"
        const timeStr = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const isFinished = fixture.status === 'Match Finished' || fixture.status === 'FT';
        const homeScore = fixture.home_score;
        const awayScore = fixture.away_score;

        let resultColor = "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400";
        let resultLabel = "";

        if (isFinished) {
            const clubScore = isHome ? homeScore : awayScore;
            const oppScore = isHome ? awayScore : homeScore;

            if (clubScore > oppScore) {
                resultColor = "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400";
                resultLabel = "W";
            } else if (clubScore < oppScore) {
                resultColor = "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400";
                resultLabel = "L";
            } else {
                resultColor = "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400";
                resultLabel = "D";
            }
        }

        return (
            <Card variant="interactive" className="p-3 sm:p-4 mb-2 flex items-center justify-between group">
                {/* Date Side */}
                <div className="flex flex-col w-12 sm:w-16 shrink-0 text-center border-r border-slate-100 dark:border-neutral-800 pr-3 sm:pr-4 mr-3 sm:mr-4">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase">
                        {date.toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-neutral-100">
                        {date.getDate()}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 dark:text-neutral-500">
                        {timeStr}
                    </span>
                </div>

                {/* Match Info */}
                <div className="flex-1 flex items-center justify-between min-w-0">
                    {/* Opponent */}
                    <Link href={`/topic/${opponent?.slug}`} className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                            {opponent?.metadata?.badge_url ? (
                                <NextImage
                                    src={opponent.metadata.badge_url}
                                    alt={opponent.title}
                                    fill
                                    className="object-contain"
                                    sizes="40px"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-200 dark:bg-neutral-700 rounded-full" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-400 dark:text-neutral-500 mb-0.5">
                                {isHome ? 'vs' : '@'}
                            </span>
                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {opponent?.title || "Unknown Team"}
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-neutral-500 truncate">
                                {fixture.competition?.title || "Premier League"}
                            </span>
                        </div>
                    </Link>

                    {/* Score / Result */}
                    <div className="flex flex-col items-end pl-3 shrink-0">
                        {isFinished ? (
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${resultColor}`}>
                                    {resultLabel}
                                </span>
                                <span className="font-mono font-bold text-base sm:text-lg text-slate-900 dark:text-neutral-100">
                                    {homeScore}-{awayScore}
                                </span>
                            </div>
                        ) : (
                            <Badge variant="secondary" className="text-[10px] text-slate-500 bg-slate-100 dark:bg-neutral-800">
                                Upcoming
                            </Badge>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                        Upcoming Fixtures
                    </h3>
                    <div className="space-y-2">
                        {upcoming.map(f => <FixtureItem key={f.id} fixture={f} />)}
                    </div>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                        Recent Results
                    </h3>
                    <div className="space-y-2">
                        {results.map(f => <FixtureItem key={f.id} fixture={f} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
