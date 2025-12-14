"use client";

import Link from "next/link";
import { ChevronRight, Users, Share2, MapPin, Calendar, Flag, Ruler, Hash, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PLAYER_IMAGE_STYLE } from "@/components/FeaturedPlayers";

interface EntityHeaderProps {
    title: string;
    type: "club" | "player" | "league";
    imageUrl?: string;
    badgeUrl?: string;
    followerCount?: number;
    metadata?: {
        position?: string;
        rating?: string;
        height?: string;
        kitNumber?: string | number;
        age?: number;
        nationality?: string;
        league?: string;
        leagueSlug?: string;
        stadium?: string;
        founded?: string | number;
        country?: string;
        clubCount?: number;
        clubName?: string;
        clubSlug?: string;
        clubBadgeUrl?: string;
    };
    backHref?: string;
}

export function EntityHeader({
    title,
    type,
    imageUrl,
    badgeUrl,
    followerCount = 0,
    metadata,
    backHref = "/",
}: EntityHeaderProps) {
    const isPlayer = type === "player";
    const isClub = type === "club";
    const displayImage = isPlayer ? imageUrl : badgeUrl;

    // Build proper breadcrumb: League > Club > Player
    const breadcrumbs = isPlayer
        ? [
            { label: "Home", href: "/" },
            { label: "Leagues", href: "/leagues" },
            ...(metadata?.league ? [{
                label: metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, ''),
                href: `/leagues/${metadata.leagueSlug || metadata.league.toLowerCase().replace(/\s+/g, '-')}`
            }] : []),
            ...(metadata?.clubName ? [{
                label: metadata.clubName,
                href: `/topic/${metadata.clubSlug || metadata.clubName.toLowerCase().replace(/\s+/g, '-')}`
            }] : []),
            { label: title, href: null }
        ]
        : isClub
            ? [
                { label: "Home", href: "/" },
                { label: "Leagues", href: "/leagues" },
                ...(metadata?.league ? [{
                    label: metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, ''),
                    href: `/leagues/${metadata.leagueSlug || metadata.league.toLowerCase().replace(/\s+/g, '-')}`
                }] : []),
                { label: title, href: null }
            ]
            : [
                { label: "Home", href: "/" },
                { label: "Leagues", href: "/leagues" },
                { label: title, href: null }
            ];

    return (
        <div className="mb-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1 mb-4 text-sm flex-wrap">
                {breadcrumbs.map((crumb, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                        {idx > 0 && (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600" />
                        )}
                        {crumb.href ? (
                            <Link href={crumb.href}>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                                    {crumb.label}
                                </Button>
                            </Link>
                        ) : (
                            <span className="px-2 font-semibold text-slate-900 dark:text-neutral-100">
                                {crumb.label}
                            </span>
                        )}
                    </div>
                ))}
            </nav>

            {/* Hero Card */}
            <Card className="relative overflow-hidden">
                {/* Background Watermark - Full image, moved slightly left */}
                {displayImage && (
                    <div className="absolute right-8 -bottom-4 w-52 h-52 opacity-[0.04] grayscale pointer-events-none select-none">
                        <img src={displayImage} alt="" className="w-full h-full object-contain" />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                    <div className={`flex gap-6 ${isPlayer ? 'items-end' : 'items-center'}`}>
                        {/* Avatar */}
                        <div className="shrink-0">
                            {isPlayer ? (
                                /* Player: Full headshot, no crop */
                                <div className="relative pl-6 pt-4" style={{ width: '140px' }}>
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-auto object-contain"
                                            style={{ maxHeight: '160px' }}
                                        />
                                    ) : (
                                        <div className="w-24 h-32 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                                            <span className="text-3xl opacity-20">👤</span>
                                        </div>
                                    )}
                                    {metadata?.rating && (
                                        <div className="absolute top-4 right-0 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 rounded-md text-sm font-bold text-white dark:text-neutral-900">
                                            {metadata.rating}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Club: Badge with minimal padding */
                                <div className="pl-6 py-4">
                                    <img
                                        src={badgeUrl}
                                        alt={title}
                                        className="w-20 h-20 object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className={`flex-1 min-w-0 ${isPlayer ? 'pr-6 pt-6 pb-5' : 'pr-6 py-4'}`}>
                            {/* Title Row */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                                    {title}
                                </h1>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="pill" size="pill-sm">
                                        Follow
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <Badge variant="secondary" className="text-[10px] capitalize">
                                    {type}
                                </Badge>
                                {isPlayer && metadata?.position && (
                                    <Badge variant="secondary" className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                                        {metadata.position}
                                    </Badge>
                                )}
                                {isClub && metadata?.league && (
                                    <Badge variant="secondary" className="text-[10px]">
                                        {metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                    </Badge>
                                )}
                            </div>

                            {/* Stats Row - Height, Age, Nationality, then Club for players */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-neutral-400">
                                {isPlayer && (
                                    <>
                                        {metadata?.height && (
                                            <div className="flex items-center gap-1.5">
                                                <Ruler className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                                <span>{metadata.height}</span>
                                            </div>
                                        )}
                                        {metadata?.age && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                                <span>{metadata.age} years</span>
                                            </div>
                                        )}
                                        {metadata?.nationality && (
                                            <div className="flex items-center gap-1.5">
                                                <Flag className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                                <span>{metadata.nationality}</span>
                                            </div>
                                        )}
                                        {metadata?.kitNumber && (
                                            <div className="flex items-center gap-1.5">
                                                <Hash className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                                <span>{metadata.kitNumber}</span>
                                            </div>
                                        )}
                                        {/* Club as ghost button - only club logo, no badge icon */}
                                        {metadata?.clubName && (
                                            <Link href={`/topic/${metadata.clubSlug || metadata.clubName.toLowerCase().replace(/\s+/g, '-')}`}>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5">
                                                    {metadata.clubBadgeUrl && (
                                                        <img src={metadata.clubBadgeUrl} alt="" className="w-4 h-4 object-contain" />
                                                    )}
                                                    <span>{metadata.clubName}</span>
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                                {isClub && (
                                    <>
                                        {metadata?.stadium && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                                <span>{metadata.stadium}</span>
                                            </div>
                                        )}
                                        {metadata?.founded && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                                <span>Est. {metadata.founded}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 px-6 py-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-sm font-semibold">
                        <Users className="w-4 h-4" />
                        <span>{followerCount.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                        <Activity className="w-4 h-4" />
                        <span>#3 Trending</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
