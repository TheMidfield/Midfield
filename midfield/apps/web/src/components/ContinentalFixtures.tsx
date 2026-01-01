"use client";

import NextImage from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";

interface ContinentalFixturesProps {
    fixtures: any[];
}

export function ContinentalFixtures({ fixtures }: ContinentalFixturesProps) {
    if (!fixtures || fixtures.length === 0) {
        return (
            <div className="text-center py-6 text-slate-500 dark:text-neutral-500 text-sm">
                No fixtures available.
            </div>
        );
    }

    const now = new Date();

    const finishedMatches = fixtures
        .filter(f => {
            const status = f.status;
            // Include FT, ABD, AET, PEN as finished
            return (status === 'FT' || status === 'ABD' || status === 'AET' || status === 'PEN');
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

    const upcomingMatches = fixtures
        .filter(f => {
            const status = f.status;
            // Include scheduled, live, postponed
            return status !== 'FT' && status !== 'ABD' && status !== 'AET' && status !== 'PEN';
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Soonest first

    const getDateKey = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-CA'); // YYYY-MM-DD
    };

    const getUniqueDates = (matches: any[], limit: number) => {
        const dates = new Set<string>();
        for (const m of matches) {
            dates.add(getDateKey(m.date));
            if (dates.size >= limit) break;
        }
        return Array.from(dates);
    };

    const resultDates = getUniqueDates(finishedMatches, 2);
    const upcomingDates = getUniqueDates(upcomingMatches, 2);

    const FixtureRow = ({ fixture }: { fixture: any }) => {
        const homeName = fixture.home_team_name || "Unknown";
        const awayName = fixture.away_team_name || "Unknown";
        const homeBadge = fixture.home_team_badge;
        const awayBadge = fixture.away_team_badge;
        const homeSlug = fixture.home_team?.slug;
        const awaySlug = fixture.away_team?.slug;

        const date = new Date(fixture.date);
        const status = fixture.status;
        const isFinished = status === 'FT' || status === 'ABD' || status === 'AET' || status === 'PEN';
        const isLive = status === 'LIVE' || status === 'HT' || status === '1H' || status === '2H' || status === 'ET' || status === 'P' || status === 'BT';
        const isPostponed = status === 'PST';

        let resultBg = "bg-slate-50 dark:bg-neutral-800/50";
        let resultBorder = "";

        if (isLive) {
            resultBg = "bg-amber-50 dark:bg-amber-950/20";
            resultBorder = "border-l-2 border-l-amber-500 animate-pulse";
        } else if (isPostponed) {
            resultBorder = "border-l-2 border-l-slate-300";
        }

        const homeScore = fixture.home_score;
        const awayScore = fixture.away_score;

        const TeamDisplay = ({ name, badge, slug, alignRight }: { name: string, badge: string | null, slug?: string, alignRight?: boolean }) => {
            const Content = (
                <div className={`flex items-center gap-2 min-w-0 ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0">
                        {badge ? (
                            <NextImage src={badge} alt={name} fill unoptimized={true} className="object-contain" sizes="24px" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                                <Shield className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate">
                        {name}
                    </span>
                </div>
            );

            if (slug) {
                return (
                    <Link href={`/topic/${slug}`} className="block w-full group/team">
                        <div className={`flex items-center gap-2 min-w-0 ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
                            <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0 group-hover/team:scale-110 transition-transform duration-300">
                                {badge ? (
                                    <NextImage src={badge} alt={name} fill unoptimized={true} className="object-contain" sizes="24px" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                                        <Shield className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate group-hover/team:text-emerald-600 dark:group-hover/team:text-emerald-400 transition-colors">
                                {name}
                            </span>
                        </div>
                    </Link>
                );
            }
            return <div className="truncate w-full">{Content}</div>;
        };

        return (
            <div className={`flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-md ${resultBg} ${resultBorder}`}>
                {/* Time - Desktop */}


                {/* Matchup Grid */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 flex-1">
                    {/* Home */}
                    <TeamDisplay name={homeName} badge={homeBadge} slug={homeSlug} alignRight={true} />

                    {/* Score/Time Center */}
                    <div className="w-12 sm:w-16 text-center shrink-0">
                        {isFinished || isLive ? (
                            <div className={`px-1.5 py-0.5 rounded text-xs sm:text-sm font-bold ${isLive ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 dark:bg-neutral-700 text-slate-900 dark:text-neutral-100'}`}>
                                {homeScore !== null ? homeScore : 0} - {awayScore !== null ? awayScore : 0}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-neutral-300">
                                    {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Away */}
                    <TeamDisplay name={awayName} badge={awayBadge} slug={awaySlug} />
                </div>
            </div>
        );
    };

    const renderDateGroup = (dateKey: string, matches: any[]) => {
        const matchesForDay = matches.filter(f => getDateKey(f.date) === dateKey);
        // Sort matches within the day by time (Ascending)
        matchesForDay.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const dateObj = new Date(matchesForDay[0].date);
        const dateLabel = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

        return (
            <div key={dateKey} className="mb-6 last:mb-0">
                <div className="mb-2 pl-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                        {dateLabel}
                    </span>
                </div>
                <div className="space-y-1.5">
                    {matchesForDay.map(f => <FixtureRow key={f.id} fixture={f} />)}
                </div>
            </div>
        );
    };

    return (
        <div className="pt-3 sm:pt-4">
            {/* Results: Render in order of resultDates array (Newest first) */}
            {resultDates.map(dateKey => renderDateGroup(dateKey, finishedMatches))}

            {/* Divider if both exist */}
            {resultDates.length > 0 && upcomingDates.length > 0 && <div className="h-4" />}

            {/* Upcoming: Render in order of upcomingDates (Soonest first) */}
            {upcomingDates.map(dateKey => renderDateGroup(dateKey, upcomingMatches))}

            {resultDates.length === 0 && upcomingDates.length === 0 && (
                <div className="text-center py-6 text-slate-500 dark:text-neutral-500 text-sm">
                    No recent or upcoming matches found.
                </div>
            )}
        </div>
    );
}
