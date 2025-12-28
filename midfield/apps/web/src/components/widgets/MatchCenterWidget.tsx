"use client";

import { useEffect, useState, memo } from "react";
import { Calendar, Shield, Flame, Clock } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { getMatchCenterData, type MatchCenterFixture } from "@/app/actions/fetch-widget-data";

// Format date for display
function formatMatchDate(dateStr: string): { day: string; time: string; isToday: boolean; isTomorrow: boolean } {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });

    let day: string;
    if (isToday) {
        day = 'Today';
    } else if (isTomorrow) {
        day = 'Tomorrow';
    } else {
        day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    return { day, time, isToday, isTomorrow };
}

// Skeleton for loading state
const SkeletonFixture = memo(() => (
    <div className="p-3 rounded-lg border border-slate-100 dark:border-neutral-800 animate-pulse">
        <div className="flex items-center justify-between mb-2">
            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-20" />
            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-16" />
        </div>
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-slate-200 dark:bg-neutral-700 rounded" />
                <div className="h-4 bg-slate-200 dark:bg-neutral-700 rounded w-20" />
            </div>
            <div className="text-xs text-slate-300 dark:text-neutral-600">vs</div>
            <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="h-4 bg-slate-200 dark:bg-neutral-700 rounded w-20" />
                <div className="w-8 h-8 bg-slate-200 dark:bg-neutral-700 rounded" />
            </div>
        </div>
    </div>
));
SkeletonFixture.displayName = 'SkeletonFixture';

// Team badge component
const TeamBadge = memo(({ team, side }: { 
    team: MatchCenterFixture['homeTeam']; 
    side: 'home' | 'away';
}) => (
    <Link 
        href={`/topic/${team.slug}`}
        className={`flex items-center gap-2 group min-w-0 flex-1 ${side === 'away' ? 'flex-row-reverse' : ''}`}
    >
        <div className="relative w-8 h-8 shrink-0">
            {team.badgeUrl ? (
                <NextImage
                    src={team.badgeUrl}
                    alt={team.title}
                    fill
                    sizes="32px"
                    className="object-contain"
                />
            ) : (
                <Shield className="w-full h-full text-slate-300 dark:text-neutral-600" />
            )}
        </div>
        <span className={`text-sm font-semibold text-slate-800 dark:text-neutral-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${side === 'away' ? 'text-right' : ''}`}>
            {team.title}
        </span>
    </Link>
));
TeamBadge.displayName = 'TeamBadge';

// Single fixture card
const FixtureCard = memo(({ fixture }: { fixture: MatchCenterFixture }) => {
    const { day, time, isToday, isTomorrow } = formatMatchDate(fixture.date);

    return (
        <div className={`p-3 rounded-lg border transition-colors ${
            fixture.isTopMatch 
                ? 'border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-neutral-900' 
                : 'border-slate-100 dark:border-neutral-800 hover:border-slate-200 dark:hover:border-neutral-700'
        }`}>
            {/* Header: Competition & Time */}
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {fixture.competition.logoUrl && (
                        <div className="relative w-4 h-4 shrink-0">
                            <NextImage
                                src={fixture.competition.logoUrl}
                                alt={fixture.competition.title}
                                fill
                                sizes="16px"
                                className="object-contain"
                            />
                        </div>
                    )}
                    <span className="text-[10px] font-medium text-slate-500 dark:text-neutral-500 truncate">
                        {fixture.competition.title.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                    </span>
                    {fixture.isTopMatch && (
                        <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400 shrink-0" />
                    )}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-medium shrink-0 ${
                    isToday 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : isTomorrow 
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400 dark:text-neutral-500'
                }`}>
                    <Clock className="w-3 h-3" />
                    <span>{day}</span>
                    <span className="text-slate-300 dark:text-neutral-600">·</span>
                    <span>{time}</span>
                </div>
            </div>

            {/* Teams */}
            <div className="flex items-center gap-2">
                <TeamBadge team={fixture.homeTeam} side="home" />
                <div className="shrink-0 w-6 text-center">
                    <span className="text-[10px] font-bold text-slate-300 dark:text-neutral-600 uppercase">vs</span>
                </div>
                <TeamBadge team={fixture.awayTeam} side="away" />
            </div>
        </div>
    );
});
FixtureCard.displayName = 'FixtureCard';

export function MatchCenterWidget() {
    const [fixtures, setFixtures] = useState<MatchCenterFixture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        getMatchCenterData(5)
            .then((data) => {
                if (mounted) {
                    setFixtures(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to fetch match center:", err);
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 dark:text-emerald-400" />
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-neutral-100">
                        Match Center
                    </h3>
                </div>
                <div className="space-y-2.5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonFixture key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // No fixtures available
    if (fixtures.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 dark:text-emerald-400" />
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-neutral-100">
                        Match Center
                    </h3>
                </div>
                <div className="text-center py-8 text-sm text-slate-500 dark:text-neutral-500">
                    No upcoming fixtures scheduled
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-neutral-100">
                    Match Center
                </h3>
            </div>

            {/* Fixtures list */}
            <div className="space-y-2.5">
                {fixtures.map((fixture) => (
                    <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
            </div>
        </div>
    );
}
