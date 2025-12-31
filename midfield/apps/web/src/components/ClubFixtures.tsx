
"use client";

import NextImage from "next/image";
import { Home, Plane, Shield } from "lucide-react";

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
    showFormOnly?: boolean; // For manager pages - only show form/standing info
}

export function ClubFixtures({ clubId, fixtures, clubStanding, showFormOnly = false }: ClubFixturesProps) {
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
        .reverse()
        .slice(0, 5); // Show last 5 results

    const upcoming = fixtures
        .filter(f => new Date(f.date) >= now)
        .slice(0, 5); // Show next 5 upcoming

    // Form Bubbles Helper
    const FormBubbles = ({ form }: { form: string }) => {
        if (!form) return null;

        return (
            <div className="flex items-center gap-1">
                {form.split('').map((result, i) => {
                    let color = "bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400";
                    if (result === 'W') color = "bg-emerald-500 dark:bg-emerald-600 text-white";
                    if (result === 'L') color = "bg-rose-500 dark:bg-rose-600 text-white";
                    if (result === 'D') color = "bg-slate-400 dark:bg-neutral-500 text-white";

                    return (
                        <div
                            key={i}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[10px] sm:text-xs font-bold ${color}`}
                            title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                        >
                            {result}
                        </div>
                    );
                })}
            </div>
        );
    };

    const FixtureRow = ({ fixture }: { fixture: any }) => {
        const isHome = fixture.home_team_id === clubId;
        const opponent = isHome ? fixture.away_team : fixture.home_team;
        const date = new Date(fixture.date);

        const homeScore = fixture.home_score;
        const awayScore = fixture.away_score;

        // Strict Enum Checks
        const status = fixture.status;
        const isFinished = status === 'FT' || status === 'ABD'; // Treat Abandoned as finished for display? Or handle separately?
        const isLive = status === 'LIVE' || status === 'HT';
        const isPostponed = status === 'PST';

        let resultBg = "";
        let resultBorder = "";

        if (isFinished) {
            const clubScore = isHome ? homeScore : awayScore;
            const oppScore = isHome ? awayScore : homeScore;
            if (clubScore > oppScore) {
                resultBg = "bg-emerald-50 dark:bg-emerald-950/20";
                resultBorder = "border-l-2 border-l-emerald-500";
            } else if (clubScore < oppScore) {
                resultBg = "bg-rose-50 dark:bg-rose-950/20";
                resultBorder = "border-l-2 border-l-rose-500";
            } else {
                resultBg = "bg-slate-50 dark:bg-neutral-800/50";
                resultBorder = "border-l-2 border-l-slate-400";
            }
        } else if (isLive) {
            resultBg = "bg-amber-50 dark:bg-amber-950/20";
            resultBorder = "border-l-2 border-l-amber-500 animate-pulse";
        } else if (isPostponed) {
            resultBg = "bg-slate-100 dark:bg-neutral-800";
            resultBorder = "border-l-2 border-l-slate-300";
        }

        const containerClasses = `flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md ${resultBg || 'bg-slate-50 dark:bg-neutral-800/50'} ${resultBorder}`;

        return (
            <div className={containerClasses}>
                {/* Date */}
                <div className="w-10 sm:w-12 text-center shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400 block">
                        {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                </div>

                {/* Home/Away indicator */}
                <div className="w-4 shrink-0 flex items-center justify-center" title={isHome ? 'Home' : 'Away'}>
                    {isHome ? (
                        <Home className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    ) : (
                        <Plane className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    )}
                </div>

                {/* Opponent Badge + Name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative w-6 h-6 shrink-0">
                        {opponent?.metadata?.badge_url ? (
                            <NextImage
                                src={opponent.metadata.badge_url}
                                alt={opponent.title}
                                fill
                                className="object-contain"
                                sizes="24px"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                                <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate">
                        {opponent?.title || "TBD"}
                    </span>
                </div>

                {/* Score / Time */}
                <div className="shrink-0 text-right">
                    {isFinished ? (
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-neutral-100">
                            {homeScore}-{awayScore}
                        </span>
                    ) : (
                        <span className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400">
                            {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div >
        );
    };

    return (
        <div
            className="squad-scroll pt-3 sm:pt-4 -mr-2 sm:-mr-3 pr-3 sm:pr-4 overflow-y-auto"
            style={{ maxHeight: showFormOnly ? '220px' : '400px' }}
        >
            {/* Season Performance Card */}
            {clubStanding && (
                <div className={showFormOnly ? "" : "mb-4"}>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-800/50 rounded-md p-3 sm:p-4 border border-slate-200 dark:border-neutral-700">
                        {/* Position & Points Row */}
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 flex items-center justify-center">
                                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-neutral-100">
                                        {clubStanding.position}
                                    </span>
                                </div>
                                <div className="-space-y-0.5">
                                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wide block">Position</span>
                                    <span className="text-xs text-slate-500 dark:text-neutral-400">{clubStanding.played} games played</span>
                                </div>
                            </div>
                            <div className="text-right -space-y-0.5">
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{clubStanding.points}</span>
                                <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wide block">Points</span>
                            </div>
                        </div>

                        {/* W/D/L Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                            <div className="bg-white dark:bg-neutral-900 rounded-md p-2 border border-slate-100 dark:border-neutral-700/50">
                                <span className="block font-bold text-emerald-600 dark:text-emerald-400">{clubStanding.won}</span>
                                <span className="text-[10px] text-slate-400 dark:text-neutral-500">W</span>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 rounded-md p-2 border border-slate-100 dark:border-neutral-700/50">
                                <span className="block font-bold text-slate-600 dark:text-neutral-300">{clubStanding.drawn}</span>
                                <span className="text-[10px] text-slate-400 dark:text-neutral-500">D</span>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 rounded-md p-2 border border-slate-100 dark:border-neutral-700/50">
                                <span className="block font-bold text-rose-600 dark:text-rose-400">{clubStanding.lost}</span>
                                <span className="text-[10px] text-slate-400 dark:text-neutral-500">L</span>
                            </div>
                        </div>

                        {/* Form */}
                        {clubStanding.form && (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wide">Form</span>
                                <FormBubbles form={clubStanding.form} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Show fixtures only if not showFormOnly */}
            {!showFormOnly && (
                <>
                    {/* Recent Results */}
                    {results.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                                    Results
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-slate-300 dark:text-neutral-600">
                                    {results.length}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {results.map(f => <FixtureRow key={f.id} fixture={f} />)}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Fixtures */}
                    {upcoming.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                                    Upcoming
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-slate-300 dark:text-neutral-600">
                                    {upcoming.length}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {upcoming.map(f => <FixtureRow key={f.id} fixture={f} />)}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
