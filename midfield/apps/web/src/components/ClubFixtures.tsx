
"use client";

import { useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
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
        total_teams?: number;
    } | null;
    league?: {
        name?: string;
        slug?: string;
        badgeUrl?: string;
        badgeDarkUrl?: string;
    };
    showFormOnly?: boolean; // For manager pages - only show form/standing info
}

export function ClubFixtures({ clubId, fixtures, clubStanding, league, showFormOnly = false }: ClubFixturesProps) {
    const [hoveredOpponent, setHoveredOpponent] = useState<string | null>(null);

    if ((!fixtures || fixtures.length === 0) && !clubStanding) {
        return (
            <div className="text-center py-6 text-slate-500 dark:text-neutral-500 text-sm">
                No fixtures or league data available.
            </div>
        );
    }

    // Split into Upcoming vs Results
    const now = new Date();

    // Get all finished OR currently active matches, sorted by date (most recent first)
    // CRITICAL: We include LIVE/HT here so they appear at the top of the "Results" list as "In Progress" games
    const finishedMatches = fixtures
        .filter(f => {
            const isStarted = new Date(f.date) < now;
            const isLive = f.status === 'LIVE' || f.status === 'HT' || f.status === 'INT';
            const isFinished = f.status === 'FT' || f.status === 'ABD';
            return isStarted && (isLive || isFinished);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get last 3 results (most recent finished/live matches)
    // This allows Live matches to appear at the very top of the "Results" list
    const results = finishedMatches.slice(0, 3).reverse();

    // Get upcoming matches, sorted by date (soonest first)
    const upcoming = fixtures
        .filter(f => {
            // Only purely future matches that haven't started (or are NS)
            // If it's LIVE/HT, it belongs in results.
            // If it's NS but date < now (stuck NS), we might want to show it here or results?
            // Le's stick to strict date for upcoming to avoid confusion.
            return new Date(f.date) >= now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    // Get last 5 matches for form display (oldest first for left-to-right reading)
    const last5Matches = finishedMatches.slice(0, 5).reverse();

    // Get next match
    const nextMatch = upcoming[0];

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
        const opponentName = opponent?.title || (isHome ? fixture.away_team_name : fixture.home_team_name) || "Unknown Team";
        const opponentBadge = opponent?.metadata?.badge_url || (isHome ? fixture.away_team_badge : fixture.home_team_badge);
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
            resultBg = "bg-emerald-50 dark:bg-emerald-950/20";
            resultBorder = "border-l-2 border-l-emerald-500 animate-pulse";
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

                {/* Opponent Badge + Name - Clickable with hover */}
                <div className="flex items-center gap-2 flex-1 min-w-0 group">
                    {opponent?.slug && !opponent?.metadata?.is_stub ? (
                        <Link href={`/topic/${opponent.slug}`}>
                            <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                                {opponentBadge ? (
                                    <NextImage
                                        src={opponentBadge}
                                        alt={opponentName}
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
                    ) : (
                        <div className="relative w-6 h-6 shrink-0">
                            {opponentBadge ? (
                                <NextImage
                                    src={opponentBadge}
                                    alt={opponentName}
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
                    )}
                    {opponent?.slug && !opponent?.metadata?.is_stub ? (
                        <Link href={`/topic/${opponent.slug}`} className="truncate">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block">
                                {opponentName}
                            </span>
                        </Link>
                    ) : (
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate">
                            {opponentName}
                        </span>
                    )}
                </div>

                {/* Score / Time */}
                <div className="shrink-0 text-right">
                    {isFinished ? (
                        <span className="font-bold text-sm text-slate-900 dark:text-neutral-100">
                            {homeScore}–{awayScore}
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
        <div className="pt-3 sm:pt-4">
            {/* Team Form - Minimal Display */}
            {clubStanding && (
                <div className={showFormOnly ? "" : "mb-6"}>
                    <div className="space-y-6">
                        {/* Last 5 Matches - Centered with equal spacing */}
                        {last5Matches.length > 0 && (
                            <div>
                                <span className={`text-xs block mb-3 text-center transition-all duration-200 min-h-[1rem] ${hoveredOpponent ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' : 'text-slate-400 dark:text-neutral-500'}`}>
                                    {hoveredOpponent || "Last 5 Matches"}
                                </span>
                                <div className="flex items-center justify-center gap-4">
                                    {last5Matches.map((match, idx) => {
                                        const isHome = match.home_team_id === clubId;
                                        const opponent = isHome ? match.away_team : match.home_team;
                                        const clubScore = isHome ? match.home_score : match.away_score;
                                        const oppScore = isHome ? match.away_score : match.home_score;
                                        const opponentName = opponent?.title || (isHome ? match.away_team_name : match.home_team_name) || "Unknown Team";

                                        const isWin = clubScore > oppScore;
                                        const isLoss = clubScore < oppScore;

                                        const opponentBadge = opponent?.metadata?.badge_url ||
                                            (isHome ? match.away_team_badge : match.home_team_badge) ||
                                            null;
                                        const opponentSlug = opponent?.slug;

                                        // Score badge style - outline & lighter background
                                        const scoreBadgeStyle = isWin
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-600 dark:border-emerald-500'
                                            : isLoss
                                                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-2 border-rose-600 dark:border-rose-500'
                                                : 'bg-slate-50 dark:bg-neutral-800/50 text-slate-700 dark:text-neutral-300 border-2 border-slate-400 dark:border-neutral-600';

                                        const BadgeContent = (
                                            <div
                                                className="flex flex-col items-center gap-2"
                                                onMouseEnter={() => setHoveredOpponent(opponentName)}
                                                onMouseLeave={() => setHoveredOpponent(null)}
                                            >
                                                {/* Score Badge */}
                                                <div className={`px-2 py-0.5 rounded font-black text-[11px] ${scoreBadgeStyle}`}>
                                                    {clubScore}–{oppScore}
                                                </div>
                                                {/* Club Badge - smaller, scale on hover */}
                                                <div className="relative w-7 h-7 hover:scale-110 transition-transform">
                                                    {opponentBadge ? (
                                                        <NextImage
                                                            src={opponentBadge}
                                                            alt=""
                                                            fill
                                                            unoptimized={true}
                                                            className="object-contain"
                                                            sizes="28px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Shield className="w-6 h-6 text-slate-400 dark:text-neutral-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );

                                        if (opponentSlug && !opponent?.metadata?.is_stub) {
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={`/topic/${opponentSlug}`}
                                                >
                                                    {BadgeContent}
                                                </Link>
                                            );
                                        }

                                        return <div key={idx}>{BadgeContent}</div>;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Next Match - Similar to fixture rows */}
                        {nextMatch && (
                            <div>
                                <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-2">Next Match</span>
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50">
                                    {(() => {
                                        const isHome = nextMatch.home_team_id === clubId;
                                        const opponent = isHome ? nextMatch.away_team : nextMatch.home_team;
                                        const date = new Date(nextMatch.date);
                                        const dayMonth = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                        const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                                        const opponentBadge = opponent?.metadata?.badge_url || (isHome ? nextMatch.away_team_badge : nextMatch.home_team_badge) || null;
                                        const opponentName = opponent?.title || (isHome ? nextMatch.away_team_name : nextMatch.home_team_name) || "Unknown Team";
                                        const opponentSlug = opponent?.slug;
                                        const isStub = opponent?.metadata?.is_stub;
                                        const shouldLink = opponentSlug && !isStub;

                                        return (
                                            <>
                                                {/* Date */}
                                                <div className="w-10 sm:w-12 text-center shrink-0">
                                                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400 block">
                                                        {dayMonth}
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
                                                <div className="flex items-center gap-2 flex-1 min-w-0 group">
                                                    {shouldLink ? (
                                                        <>
                                                            <Link href={`/topic/${opponentSlug}`}>
                                                                <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                                                                    {opponentBadge ? (
                                                                        <NextImage
                                                                            src={opponentBadge}
                                                                            alt={opponentName}
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
                                                            <Link href={`/topic/${opponentSlug}`} className="truncate">
                                                                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block">
                                                                    {opponentName}
                                                                </span>
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="relative w-6 h-6 shrink-0">
                                                                {opponentBadge ? (
                                                                    <NextImage
                                                                        src={opponentBadge}
                                                                        alt={opponentName}
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
                                                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate">
                                                                {opponentName}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Time */}
                                                <div className="shrink-0 text-right">
                                                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400">
                                                        {time}
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Position & Points - Last */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-0.5">Current Standing</span>
                                <div className="flex items-end gap-2">
                                    <div className="leading-none">
                                        <span className="text-2xl font-black text-slate-900 dark:text-neutral-100">{clubStanding.position}</span>
                                        <span className="text-sm text-slate-500 dark:text-neutral-400">/{clubStanding.total_teams || clubStanding.played}</span>
                                    </div>
                                    {league?.slug && (
                                        <Link href={`/topic/${league.slug}`} className="block mb-0.5">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors h-7">
                                                <div className="relative w-3.5 h-3.5 shrink-0">
                                                    {(league.badgeUrl || league.badgeDarkUrl) && (
                                                        <>
                                                            {league.badgeUrl && (
                                                                <NextImage
                                                                    src={league.badgeUrl}
                                                                    alt={league.name || ""}
                                                                    fill
                                                                    className={`object-contain ${league.badgeDarkUrl ? 'dark:hidden' : ''}`}
                                                                    unoptimized={true}
                                                                />
                                                            )}
                                                            {(league.badgeDarkUrl || league.badgeUrl) && (
                                                                <NextImage
                                                                    src={league.badgeDarkUrl || league.badgeUrl}
                                                                    alt={league.name || ""}
                                                                    fill
                                                                    className={`object-contain hidden ${league.badgeDarkUrl ? 'dark:block' : ''}`}
                                                                    unoptimized={true}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-neutral-200 whitespace-nowrap">
                                                    {league.name?.replace(/^(English|Spanish|Italian|German|French)\s/, '') || "League"}
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-0.5">Points</span>
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{clubStanding.points}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show fixtures only if not showFormOnly */}
            {!showFormOnly && (
                <>
                    {/* Recent Results */}
                    {results.length > 0 && (
                        <div className="mb-4">
                            <div className="mb-2">
                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                                    Results
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
                            <div className="mb-2">
                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                                    Upcoming
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
