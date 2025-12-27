
"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ClubFixturesProps {
    clubId: string;
    fixtures: any[];
    clubStanding?: {
        position: number;
        points: number;
        played: number;
        form: string;
        goals_for: number;
        goals_against: number;
        won: number;
        drawn: number;
        lost: number;
    } | null;
}

export function ClubFixtures({ clubId, fixtures, clubStanding }: ClubFixturesProps) {
    if ((!fixtures || fixtures.length === 0) && !clubStanding) {
        return (
            <div className="text-center py-6 text-slate-500 dark:text-neutral-500 text-sm">
                No fixtures or league data available.
            </div>
        );
    }

    // Split into Upcoming vs Results
    const now = new Date();
    const results = fixtures
        .filter(f => new Date(f.date) < now)
        .reverse();

    const upcoming = fixtures
        .filter(f => new Date(f.date) >= now);

    // Form Bubbles Helper
    const FormBubbles = ({ form }: { form: string }) => {
        if (!form) return null;

        return (
            <div className="flex items-center gap-1">
                {form.split('').map((result, i) => {
                    let color = "bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-500";
                    if (result === 'W') color = "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900";
                    if (result === 'L') color = "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900";
                    if (result === 'D') color = "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700";

                    return (
                        <div
                            key={i}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold ${color}`}
                            title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                        >
                            {result}
                        </div>
                    );
                })}
            </div>
        );
    };

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
            <Card className="p-3 sm:p-4 mb-2 flex items-center justify-between">
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
                    {/* Opponent - Non-clickable for now */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
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
                                <div className="w-full h-full bg-slate-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-neutral-500">
                                        {opponent?.title?.substring(0, 2).toUpperCase() || "??"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-400 dark:text-neutral-500 mb-0.5">
                                {isHome ? 'vs' : '@'}
                            </span>
                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-neutral-100 truncate">
                                {opponent?.title || "Unknown Team"}
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-neutral-500 truncate">
                                {fixture.competition?.title || "League Match"}
                            </span>
                        </div>
                    </div>

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
            {/* League Table Snippet */}
            {clubStanding && (
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                        Season Performance
                    </h3>
                    <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-slate-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 dark:text-neutral-400 mb-1">League Position</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                        {clubStanding.position}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-neutral-500">
                                        / 20
                                    </span>
                                </div>
                            </div>
                            <div className="text-end">
                                <span className="text-xs text-slate-500 dark:text-neutral-400 mb-1 block">Points</span>
                                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {clubStanding.points}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                            <div className="bg-white dark:bg-neutral-800 rounded p-2 border border-slate-100 dark:border-neutral-700/50">
                                <span className="block font-bold text-slate-900 dark:text-neutral-100">{clubStanding.won}</span>
                                <span className="text-slate-400 dark:text-neutral-500">Won</span>
                            </div>
                            <div className="bg-white dark:bg-neutral-800 rounded p-2 border border-slate-100 dark:border-neutral-700/50">
                                <span className="block font-bold text-slate-900 dark:text-neutral-100">{clubStanding.drawn}</span>
                                <span className="text-slate-400 dark:text-neutral-500">Drawn</span>
                            </div>
                            <div className="bg-white dark:bg-neutral-800 rounded p-2 border border-slate-100 dark:border-neutral-700/50">
                                <span className="block font-bold text-slate-900 dark:text-neutral-100">{clubStanding.lost}</span>
                                <span className="text-slate-400 dark:text-neutral-500">Lost</span>
                            </div>
                        </div>

                        {clubStanding.form && (
                            <div>
                                <span className="text-xs text-slate-500 dark:text-neutral-400 block mb-2">Recent Form</span>
                                <FormBubbles form={clubStanding.form} />
                            </div>
                        )}
                    </div>
                </div>
            )}

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
