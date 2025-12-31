"use client";

import { useState, memo } from "react";
import { Calendar, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useMatchCenter } from "@/lib/hooks/use-cached-data";
import type { MatchCenterFixture } from "@/app/actions/fetch-widget-data";

// Format date for display - automatically converts to user's local timezone
function formatMatchDate(dateStr: string): { dayMonth: string; time: string; fullDateTime: string } {
    const date = new Date(dateStr);

    const dayMonth = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fullDateTime = `${dayMonth} ${time}`;

    return { dayMonth, time, fullDateTime };
}

// Skeleton for loading state
const SkeletonFixture = memo(() => (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50 animate-pulse">
        <div className="flex-1 flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 dark:bg-neutral-700 rounded" />
            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-24" />
        </div>
        <div className="w-16 h-6 bg-slate-200 dark:bg-neutral-700 rounded" />
        <div className="flex-1 flex items-center gap-2 justify-end">
            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-24" />
            <div className="w-6 h-6 bg-slate-200 dark:bg-neutral-700 rounded" />
        </div>
    </div>
));
SkeletonFixture.displayName = 'SkeletonFixture';

// Single fixture row with improved layout
const FixtureRow = memo(({ fixture, showScore }: { fixture: MatchCenterFixture & { homeScore?: number; awayScore?: number }, showScore?: boolean }) => {
    const { dayMonth, time, fullDateTime } = formatMatchDate(fixture.date);

    const homeWin = showScore && fixture.homeScore! > fixture.awayScore!;
    const awayWin = showScore && fixture.awayScore! > fixture.homeScore!;

    return (
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50">
            {/* Home Team - Full width on left */}
            <div className="flex-1 min-w-0 flex items-center justify-end gap-2 group">
                <Link
                    href={`/topic/${fixture.homeTeam.slug}`}
                    className="truncate"
                >
                    <span className="text-xs sm:text-sm font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block text-right text-slate-900 dark:text-neutral-100">
                        {fixture.homeTeam.title}
                    </span>
                </Link>
                <Link href={`/topic/${fixture.homeTeam.slug}`}>
                    <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform p-1">
                        {fixture.homeTeam.badgeUrl ? (
                            <NextImage
                                src={fixture.homeTeam.badgeUrl}
                                alt={fixture.homeTeam.title}
                                fill
                                className="object-contain p-0.5"
                                sizes="24px"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                                <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            {/* Center: Date with Time OR Score with Date - consistent height */}
            <div className="shrink-0 flex items-center justify-center min-h-[32px]">
                <div className="flex flex-col items-center justify-center px-2">
                    {showScore ? (
                        <>
                            <span className="text-xs font-bold text-slate-600 dark:text-neutral-300 whitespace-nowrap leading-tight">
                                {fixture.homeScore}–{fixture.awayScore}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-neutral-400 whitespace-nowrap leading-tight">
                                {dayMonth}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-xs font-bold text-slate-600 dark:text-neutral-300 whitespace-nowrap leading-tight">
                                {dayMonth}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-neutral-400 whitespace-nowrap leading-tight">
                                {time}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Away Team - Full width on right */}
            <div className="flex-1 min-w-0 flex items-center gap-2 group">
                <Link href={`/topic/${fixture.awayTeam.slug}`}>
                    <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform p-1">
                        {fixture.awayTeam.badgeUrl ? (
                            <NextImage
                                src={fixture.awayTeam.badgeUrl}
                                alt={fixture.awayTeam.title}
                                fill
                                className="object-contain p-0.5"
                                sizes="24px"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                                <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}
                    </div>
                </Link>
                <Link
                    href={`/topic/${fixture.awayTeam.slug}`}
                    className="truncate"
                >
                    <span className="text-xs sm:text-sm font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block text-slate-900 dark:text-neutral-100">
                        {fixture.awayTeam.title}
                    </span>
                </Link>
            </div>
        </div>
    );
});
FixtureRow.displayName = 'FixtureRow';

export function MatchCenterWidget() {
    const { data: fixtures, isLoading } = useMatchCenter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'results'>('upcoming');

    // Split fixtures
    const now = new Date();

    // Results: Show last 6 finished matches
    const results = fixtures
        ?.filter(f => f.status === 'FT' && new Date(f.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6) || [];


    // Upcoming: Next 6 matches chronologically
    const upcoming = fixtures
        ?.filter(f => f.status !== 'FT')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 6) || [];

    const displayFixtures = activeTab === 'upcoming' ? upcoming : results;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-sm">
            {/* Header with elegant tabs */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex items-center gap-2 font-bold text-sm transition-all cursor-pointer ${activeTab === 'upcoming'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    Upcoming
                </button>

                <div className="w-px h-4 bg-slate-100 dark:bg-neutral-800" />

                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex items-center gap-2 font-bold text-sm transition-all cursor-pointer ${activeTab === 'results'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                        }`}
                >
                    <Trophy className="w-4 h-4" />
                    Results
                </button>
            </div>

            {/* Fixtures list */}
            <div className="space-y-1.5">
                {isLoading ? (
                    <>
                        <SkeletonFixture />
                        <SkeletonFixture />
                        <SkeletonFixture />
                        <SkeletonFixture />
                        <SkeletonFixture />
                        <SkeletonFixture />
                    </>
                ) : displayFixtures.length > 0 ? (
                    displayFixtures.map((fixture) => (
                        <FixtureRow key={fixture.id} fixture={fixture as any} showScore={activeTab === 'results'} />
                    ))
                ) : (
                    <div className="text-center py-8 text-sm text-slate-500 dark:text-neutral-500">
                        No {activeTab} fixtures
                    </div>
                )}
            </div>
        </div>
    );
}
