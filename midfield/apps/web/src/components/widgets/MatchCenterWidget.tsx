"use client";

import { memo } from "react";
import { Calendar, Shield } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useMatchCenter } from "@/lib/hooks/use-cached-data";
import type { MatchCenterFixture } from "@/app/actions/fetch-widget-data";

// Format date for display
function formatMatchDate(dateStr: string): { dayMonth: string; time: string; isToday: boolean; isTomorrow: boolean } {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const dayMonth = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    return { dayMonth, time, isToday, isTomorrow };
}

// Skeleton for loading state
const SkeletonFixture = memo(() => (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50 animate-pulse">
        <div className="w-10 sm:w-12 h-8 bg-slate-200 dark:bg-neutral-700 rounded" />
        <div className="flex-1 flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 dark:bg-neutral-700 rounded" />
            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-24" />
        </div>
        <div className="w-4 h-4 bg-slate-200 dark:bg-neutral-700 rounded-full" />
        <div className="flex-1 flex items-center gap-2 justify-end">
            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-24" />
            <div className="w-6 h-6 bg-slate-200 dark:bg-neutral-700 rounded" />
        </div>
        <div className="w-12 h-6 bg-slate-200 dark:bg-neutral-700 rounded" />
    </div>
));
SkeletonFixture.displayName = 'SkeletonFixture';

// Single fixture row - matches ClubFixtures style
const FixtureRow = memo(({ fixture, hideClubNames }: { fixture: MatchCenterFixture, hideClubNames?: boolean }) => {
    const { dayMonth, time, isToday, isTomorrow } = formatMatchDate(fixture.date);

    return (
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50">
            {/* Date - with min-width to prevent wrap */}
            <div className={`shrink-0 ${hideClubNames ? 'w-10' : 'w-10 sm:w-12'} text-center`}>
                <span className="text-[10px] sm:text-xs font-bold block text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                    {dayMonth}
                </span>
            </div>

            {/* Home Team Name - Hidden if compact */}
            {!hideClubNames && (
                <Link
                    href={`/topic/${fixture.homeTeam.slug}`}
                    className="flex-1 min-w-0 flex items-center gap-2 justify-end group/home"
                >
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 group-hover/home:text-emerald-600 dark:group-hover/home:text-emerald-400 transition-colors truncate">
                        {fixture.homeTeam.title}
                    </span>
                    <div className="relative w-6 h-6 shrink-0 transition-transform group-hover/home:scale-110">
                        {fixture.homeTeam.badgeUrl ? (
                            <NextImage
                                src={fixture.homeTeam.badgeUrl}
                                alt={fixture.homeTeam.title}
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
                </Link>
            )}

            {/* Centered: VS only when names are shown (logos are in team links) */}
            {!hideClubNames && (
                <span className="text-[10px] font-bold text-slate-300 dark:text-neutral-600 px-1 shrink-0">vs</span>
            )}

            {/* Compact mode: Home Badge + VS + Away Badge centered */}
            {hideClubNames && (
                <div className="flex items-center gap-1 shrink-0 flex-1 justify-center">
                    <Link href={`/topic/${fixture.homeTeam.slug}`} className="flex items-center gap-1.5 group/home">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 w-[22px] text-right group-hover/home:text-emerald-600 dark:group-hover/home:text-emerald-400 transition-colors">
                            {fixture.homeTeam.abbreviation || fixture.homeTeam.title.slice(0, 3).toUpperCase()}
                        </span>
                        <div className="relative w-6 h-6 shrink-0 transition-transform group-hover/home:scale-110">
                            {fixture.homeTeam.badgeUrl ? (
                                <NextImage
                                    src={fixture.homeTeam.badgeUrl}
                                    alt={fixture.homeTeam.title}
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
                    </Link>

                    <span className="text-[10px] font-bold text-slate-300 dark:text-neutral-600 px-0.5">vs</span>

                    <Link href={`/topic/${fixture.awayTeam.slug}`} className="flex items-center gap-1.5 group/away">
                        <div className="relative w-6 h-6 shrink-0 transition-transform group-hover/away:scale-110">
                            {fixture.awayTeam.badgeUrl ? (
                                <NextImage
                                    src={fixture.awayTeam.badgeUrl}
                                    alt={fixture.awayTeam.title}
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
                        <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 w-[22px] text-left group-hover/away:text-emerald-600 dark:group-hover/away:text-emerald-400 transition-colors">
                            {fixture.awayTeam.abbreviation || fixture.awayTeam.title.slice(0, 3).toUpperCase()}
                        </span>
                    </Link>
                </div>
            )}

            {/* Away Team Name - Hidden if compact */}
            {!hideClubNames && (
                <Link
                    href={`/topic/${fixture.awayTeam.slug}`}
                    className="flex-1 min-w-0 flex items-center gap-2 group/away"
                >
                    <div className="relative w-6 h-6 shrink-0 transition-transform group-hover/away:scale-110">
                        {fixture.awayTeam.badgeUrl ? (
                            <NextImage
                                src={fixture.awayTeam.badgeUrl}
                                alt={fixture.awayTeam.title}
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
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 group-hover/away:text-emerald-600 dark:group-hover/away:text-emerald-400 transition-colors truncate">
                        {fixture.awayTeam.title}
                    </span>
                </Link>
            )}

            {/* Time */}
            <div className={`shrink-0 text-right ${hideClubNames ? 'w-auto' : 'w-12'}`}>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400">
                    {time}
                </span>
            </div>
        </div>
    );
});
FixtureRow.displayName = 'FixtureRow';

export function MatchCenterWidget({ hideClubNames }: { hideClubNames?: boolean }) {
    const { data, isLoading: loading } = useMatchCenter(5);

    // Sort by date ascending (earliest first)
    const fixtures = data ? [...data].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    ) : [];

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-3 sm:p-5 shadow-sm">
            {/* Header - More discrete, centered */}
            <div className="flex items-center justify-center gap-1.5 mb-3 sm:mb-4">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <h3 className="font-display font-semibold text-sm text-slate-600 dark:text-neutral-400">
                    Upcoming Matches
                </h3>
            </div>

            {/* Fixtures list - matches ClubFixtures spacing */}
            <div className="space-y-1.5">
                {loading ? (
                    <>
                        <SkeletonFixture />
                        <SkeletonFixture />
                        <SkeletonFixture />
                        <SkeletonFixture />
                        <SkeletonFixture />
                    </>
                ) : fixtures.length > 0 ? (
                    fixtures.map((fixture) => (
                        <FixtureRow key={fixture.id} fixture={fixture} hideClubNames={hideClubNames} />
                    ))
                ) : (
                    <div className="text-center py-8 text-sm text-slate-500 dark:text-neutral-500">
                        No upcoming fixtures scheduled
                    </div>
                )}
            </div>
        </div>
    );
}
