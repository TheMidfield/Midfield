"use client";

import { useState, memo } from "react";
import { Calendar, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useMatchCenter } from "@/lib/hooks/use-cached-data";
import type { MatchCenterFixture } from "@/app/actions/fetch-widget-data";
import { getClubAbbreviation } from "@midfield/logic/src/topics";

// Format date for display - automatically converts to user's local timezone
function formatMatchDate(dateStr: string): { dayMonth: string; time: string; fullDateTime: string; isToday: boolean } {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const dayMonth = isToday ? 'Today' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fullDateTime = `${dayMonth} ${time}`;

    return { dayMonth, time, fullDateTime, isToday };
}

// Skeleton for loading state
const SkeletonFixture = memo(({ hideClubNames }: { hideClubNames?: boolean }) => (
    <div className={`flex items-center rounded-md bg-slate-50 dark:bg-neutral-800/50 animate-pulse ${hideClubNames ? 'p-1.5' : 'p-2 sm:p-2.5 gap-2 sm:gap-3'}`}>
        <div className={`flex-1 flex items-center ${hideClubNames ? 'justify-center' : 'justify-end gap-2'}`}>
            <div className={`${hideClubNames ? 'w-7 h-7' : 'w-6 h-6'} bg-slate-200 dark:bg-neutral-700 rounded`} />
            {!hideClubNames && <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-24" />}
        </div>
        <div className={`${hideClubNames ? 'w-16' : 'w-16'} h-6 bg-slate-200 dark:bg-neutral-700 rounded`} />
        <div className={`flex-1 flex items-center ${hideClubNames ? 'justify-center' : 'gap-2'}`}>
            {!hideClubNames && <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-24" />}
            <div className={`${hideClubNames ? 'w-7 h-7' : 'w-6 h-6'} bg-slate-200 dark:bg-neutral-700 rounded`} />
        </div>
    </div>
));
SkeletonFixture.displayName = 'SkeletonFixture';

// Single fixture row with improved layout
const FixtureRow = memo(({ fixture, showScore, hideClubNames }: { fixture: MatchCenterFixture & { homeScore?: number; awayScore?: number }, showScore?: boolean, hideClubNames?: boolean }) => {
    const { dayMonth, time, fullDateTime, isToday } = formatMatchDate(fixture.date);
    const isLive = fixture.status === 'LIVE' || fixture.status === 'HT';

    if (hideClubNames) {
        return (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all active:scale-[0.96] lg:active:scale-100 cursor-pointer">
                {/* Home Team - Full width on left */}
                <div className="flex-1 min-w-0 flex items-center justify-end gap-2 group">
                    <Link
                        href={`/topic/${fixture.homeTeam.slug}`}
                        className="truncate active:scale-95 lg:active:scale-100 transition-transform"
                    >
                        <span className="text-xs sm:text-sm font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block text-right text-slate-900 dark:text-neutral-100">
                            {getClubAbbreviation(fixture.homeTeam.slug, fixture.homeTeam.title)}
                        </span>
                    </Link>
                    <Link href={`/topic/${fixture.homeTeam.slug}`} className="active:scale-95 lg:active:scale-100 transition-transform">
                        <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform p-1">
                            {fixture.homeTeam.badgeUrl ? (
                                <NextImage
                                    src={fixture.homeTeam.badgeUrl}
                                    alt={fixture.homeTeam.title}
                                    fill
                                    unoptimized={true}
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
                                <span className={`text-xs font-bold whitespace-nowrap leading-tight ${isLive ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-600 dark:text-neutral-300'}`}>
                                    {fixture.homeScore ?? 0}–{fixture.awayScore ?? 0}
                                </span>
                                <span className={`text-[10px] font-medium whitespace-nowrap leading-tight ${isLive ? 'text-emerald-600 dark:text-emerald-500 animate-pulse' : 'text-slate-500 dark:text-neutral-400'}`}>
                                    {isLive ? (fixture.status === 'HT' ? 'HT' : 'LIVE') : dayMonth}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className={`text-xs font-bold whitespace-nowrap leading-tight ${isToday ? 'text-slate-900 dark:text-neutral-100 uppercase text-[10px]' : 'text-slate-600 dark:text-neutral-300'}`}>
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
                    <Link href={`/topic/${fixture.awayTeam.slug}`} className="active:scale-95 lg:active:scale-100 transition-transform">
                        <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform p-1">
                            {fixture.awayTeam.badgeUrl ? (
                                <NextImage
                                    src={fixture.awayTeam.badgeUrl}
                                    alt={fixture.awayTeam.title}
                                    fill
                                    unoptimized={true}
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
                        className="truncate active:scale-95 lg:active:scale-100 transition-transform"
                    >
                        <span className="text-xs sm:text-sm font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block text-slate-900 dark:text-neutral-100">
                            {getClubAbbreviation(fixture.awayTeam.slug, fixture.awayTeam.title)}
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
            {/* Home Team - Full width on left */}
            <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5 group">
                <Link
                    href={`/topic/${fixture.homeTeam.slug}`}
                    className="truncate active:scale-95 lg:active:scale-100 transition-transform"
                >
                    <span className="text-[11px] sm:text-xs font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 active:text-emerald-600 dark:active:text-emerald-400 lg:active:text-slate-900 dark:lg:active:text-neutral-100 transition-colors truncate block text-right text-slate-900 dark:text-neutral-100">
                        {fixture.homeTeam.title}
                    </span>
                </Link>
                <Link href={`/topic/${fixture.homeTeam.slug}`} className="active:scale-95 lg:active:scale-100 transition-transform">
                    <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                        {fixture.homeTeam.badgeUrl ? (
                            <NextImage
                                src={fixture.homeTeam.badgeUrl}
                                alt={fixture.homeTeam.title}
                                fill
                                unoptimized={true}
                                className="object-contain"
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
                            <span className={`text-xs font-bold whitespace-nowrap leading-tight ${isLive ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-600 dark:text-neutral-300'}`}>
                                {fixture.homeScore ?? 0}–{fixture.awayScore ?? 0}
                            </span>
                            <span className={`text-[10px] font-medium whitespace-nowrap leading-tight ${isLive ? 'text-emerald-600 dark:text-emerald-500 animate-pulse' : 'text-slate-500 dark:text-neutral-400'}`}>
                                {isLive ? (fixture.status === 'HT' ? 'HT' : 'LIVE') : dayMonth}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className={`text-xs font-bold whitespace-nowrap leading-tight ${isToday ? 'text-slate-900 dark:text-neutral-100 uppercase text-[10px]' : 'text-slate-600 dark:text-neutral-300'}`}>
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
            <div className="flex-1 min-w-0 flex items-center gap-1.5 group">
                <Link href={`/topic/${fixture.awayTeam.slug}`} className="active:scale-95 lg:active:scale-100 transition-transform">
                    <div className="relative w-7 h-7 shrink-0 group-hover:scale-110 transition-transform">
                        {fixture.awayTeam.badgeUrl ? (
                            <NextImage
                                src={fixture.awayTeam.badgeUrl}
                                alt={fixture.awayTeam.title}
                                fill
                                unoptimized={true}
                                className="object-contain"
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
                    className="truncate active:scale-95 lg:active:scale-100 transition-transform"
                >
                    <span className="text-[11px] sm:text-xs font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 active:text-emerald-600 dark:active:text-emerald-400 lg:active:text-slate-900 dark:lg:active:text-neutral-100 transition-colors truncate block text-slate-900 dark:text-neutral-100">
                        {fixture.awayTeam.title}
                    </span>
                </Link>
            </div>
        </div>
    );
});
FixtureRow.displayName = 'FixtureRow';

interface MatchCenterWidgetProps {
    hideClubNames?: boolean;
}

export function MatchCenterWidget({ hideClubNames }: MatchCenterWidgetProps) {
    const { data: fixtures, isLoading } = useMatchCenter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'results'>('upcoming');

    // Split fixtures safely
    const fixturesArray = fixtures || [];

    // Results: Show finished AND live matches
    const results = fixturesArray
        .filter(f => f.status === 'FT' || f.status === 'LIVE' || f.status === 'HT')
        .sort((a, b) => {
            const isLiveA = a.status === 'LIVE' || a.status === 'HT';
            const isLiveB = b.status === 'LIVE' || b.status === 'HT';

            if (isLiveA && !isLiveB) return -1;
            if (!isLiveA && isLiveB) return 1;

            return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .slice(0, 6);


    // Upcoming: Exclude FT, LIVE, HT
    const upcoming = fixturesArray
        .filter(f => f.status === 'NS' || f.status === 'PST')
        .slice(0, 6) // Select TOP 6 by Importance FIRST
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // THEN Sort by Date for display

    // Check for any currently live matches
    const hasLiveMatches = fixturesArray.some(f => f.status === 'LIVE' || f.status === 'HT');

    const displayFixtures = activeTab === 'upcoming' ? upcoming : results;

    return (
        <div className={`bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg shadow-sm ${hideClubNames ? 'p-3' : 'p-4 sm:p-5'}`}>
            {/* Title - Only show in sidebar mode */}
            {hideClubNames && (
                <div className="text-center mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-500">
                        Match Center
                    </span>
                </div>
            )}

            {/* Header with elegant tabs */}
            <div className={`flex items-center justify-center mb-5 ${hideClubNames ? 'gap-3' : 'gap-4'}`}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex items-center gap-2 font-bold transition-all cursor-pointer active:scale-90 lg:active:scale-100 ${hideClubNames ? 'text-[13px]' : 'text-sm'} ${activeTab === 'upcoming'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                        }`}
                >
                    <Calendar className={`${hideClubNames ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                    Upcoming
                </button>

                <div className="w-px h-4 bg-slate-100 dark:bg-neutral-800" />

                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex items-center gap-2 font-bold transition-all cursor-pointer active:scale-90 lg:active:scale-100 ${hideClubNames ? 'text-[13px]' : 'text-sm'} ${activeTab === 'results'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                        }`}
                >
                    <div className="relative">
                        <Trophy className={`${hideClubNames ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                        {hasLiveMatches && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>
                    Results
                </button>
            </div>

            {/* Fixtures list */}
            <div className="space-y-1.5">
                {isLoading ? (
                    <>
                        <SkeletonFixture hideClubNames={hideClubNames} />
                        <SkeletonFixture hideClubNames={hideClubNames} />
                        <SkeletonFixture hideClubNames={hideClubNames} />
                        <SkeletonFixture hideClubNames={hideClubNames} />
                        <SkeletonFixture hideClubNames={hideClubNames} />
                        <SkeletonFixture hideClubNames={hideClubNames} />
                    </>
                ) : displayFixtures.length > 0 ? (
                    displayFixtures.map((fixture) => (
                        <FixtureRow key={fixture.id} fixture={fixture as any} showScore={activeTab === 'results'} hideClubNames={hideClubNames} />
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
