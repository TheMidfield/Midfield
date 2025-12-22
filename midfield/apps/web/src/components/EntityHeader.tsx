"use client";

import Link from "next/link";
import NextImage from "next/image";
import { ChevronRight, Share2, MapPin, Calendar, Flag, Ruler, Hash, Activity, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PLAYER_IMAGE_STYLE } from "@/components/FeaturedPlayers";

interface EntityHeaderProps {
    title: string;
    type: "club" | "player" | "league";
    imageUrl?: string;
    badgeUrl?: string;
    postCount?: number;
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
    postCount = 0,
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
        <div className="mb-4 sm:mb-6">
            {/* Breadcrumb Navigation - Smooth horizontal scroll on mobile */}
            <nav className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm overflow-x-auto scrollbar-hide pb-1">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={idx} className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0">
                            {idx > 0 && (
                                <ChevronRight className="w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 text-slate-300 dark:text-neutral-600 shrink-0" />
                            )}
                            {crumb.href ? (
                                <Link href={crumb.href}>
                                    <Button variant="ghost" size="sm" className="h-5 sm:h-6 md:h-7 px-1 sm:px-1.5 md:px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap transition-colors">
                                        {crumb.label}
                                    </Button>
                                </Link>
                            ) : (
                                <span className="px-1 sm:px-1.5 md:px-2 font-semibold text-slate-900 dark:text-neutral-100 text-[10px] sm:text-xs md:text-sm truncate max-w-[100px] sm:max-w-[130px] md:max-w-none">
                                    {crumb.label}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </nav>

            {/* Hero Card */}
            <Card className="relative overflow-hidden">
                {/* Background Watermark */}
                {displayImage && (
                    <div className="hidden md:block absolute right-8 -bottom-4 w-52 h-52 opacity-[0.04] grayscale pointer-events-none select-none">
                        <NextImage
                            src={displayImage}
                            alt=""
                            fill
                            className="object-contain"
                        />
                    </div>
                )}

                {/* Content - Consistent horizontal layout, smart mobile sizing */}
                <div className="relative z-10 pl-2.5 sm:pl-4 md:pl-6 pt-1.5 sm:pt-0">
                    <div className={`flex gap-3 sm:gap-5 md:gap-7 ${isPlayer ? 'items-end' : 'items-center'}`}>
                        {/* Avatar - Unified sizing for both types */}
                        <div className="shrink-0">
                            {isPlayer ? (
                                <div className={`relative ${imageUrl ? 'w-24 h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-32 lg:h-32' : 'w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32 lg:w-36 lg:h-36'} pl-1 sm:pl-2 md:pl-3 lg:pl-4`}>
                                    {imageUrl ? (
                                        <NextImage
                                            src={imageUrl}
                                            alt={title}
                                            fill
                                            className="object-contain object-bottom"
                                            sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 144px"
                                            priority
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-24 sm:h-32 md:h-36 lg:h-44 bg-slate-300 dark:bg-neutral-700 mx-auto"
                                            style={{
                                                mask: "url('/player-silhouette.png') no-repeat bottom center",
                                                WebkitMask: "url('/player-silhouette.png') no-repeat bottom center",
                                                maskSize: "contain",
                                                WebkitMaskSize: "contain"
                                            }}
                                        />
                                    )}
                                    {metadata?.rating && (
                                        <div className="absolute top-0 sm:top-1 md:top-2 right-0 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-900 dark:bg-slate-100 rounded-md text-[10px] sm:text-xs font-bold text-white dark:text-neutral-900 shadow-sm">
                                            {metadata.rating}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="pl-1 sm:pl-2 md:pl-3 lg:pl-4 py-4 sm:py-5 md:py-8 lg:py-10 relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                                    <NextImage
                                        src={badgeUrl || ''}
                                        alt={title}
                                        fill
                                        className="object-contain p-1 sm:p-1.5"
                                        sizes="(max-width: 640px) 56px, (max-width: 768px) 80px, 112px"
                                        priority
                                    />
                                </div>
                            )}
                        </div>

                        {/* Info - Unified padding for both types */}
                        <div className="flex-1 min-w-0 pr-2.5 sm:pr-4 md:pr-6 py-3 sm:py-4 md:py-5 flex flex-col justify-center">
                            
                            {/* Row 1: Title + Actions */}
                            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 sm:mb-1.5 md:mb-2">
                                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-neutral-100 leading-tight truncate">
                                    {title}
                                </h1>
                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    <Button variant="pill" size="pill-sm" className="h-7 sm:h-8 px-3 sm:px-4 text-[11px] sm:text-xs">
                                        Follow
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-md">
                                        <Share2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Row 2: Badges */}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-1.5 md:mb-2">
                                <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize h-5 sm:h-auto px-2 sm:px-2.5 py-0.5 sm:py-1">
                                    {type}
                                </Badge>
                                {isPlayer && metadata?.position && (
                                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 h-5 sm:h-auto px-2 sm:px-2.5 py-0.5 sm:py-1">
                                        {metadata.position}
                                    </Badge>
                                )}
                                {isClub && metadata?.league && (
                                    <Badge variant="secondary" className="text-[10px] sm:text-xs h-5 sm:h-auto px-2 sm:px-2.5 py-0.5 sm:py-1">
                                        {metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                    </Badge>
                                )}
                            </div>

                            {/* Row 3: Stats */}
                            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-5 gap-y-1 text-[11px] sm:text-xs md:text-sm text-slate-500 dark:text-neutral-400">
                                {isPlayer && (
                                    <>
                                        {metadata?.height && (
                                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                                <Ruler className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-slate-400 dark:text-neutral-500" />
                                                <span className="whitespace-nowrap font-medium">{metadata.height}</span>
                                            </div>
                                        )}
                                        {metadata?.age && (
                                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                                <Calendar className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-slate-400 dark:text-neutral-500" />
                                                <span className="whitespace-nowrap font-medium">{metadata.age} years</span>
                                            </div>
                                        )}
                                        {metadata?.nationality && (
                                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                                <Flag className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-slate-400 dark:text-neutral-500" />
                                                <span className="whitespace-nowrap font-medium">{metadata.nationality}</span>
                                            </div>
                                        )}
                                        {metadata?.kitNumber && (
                                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                                <Hash className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-slate-400 dark:text-neutral-500" />
                                                <span className="whitespace-nowrap font-medium">#{metadata.kitNumber}</span>
                                            </div>
                                        )}
                                        {metadata?.clubName && (
                                            <Link href={`/topic/${metadata.clubSlug || metadata.clubName.toLowerCase().replace(/\s+/g, '-')}`} className="shrink-0">
                                                <Button variant="ghost" size="sm" className="h-6 sm:h-7 px-1.5 sm:px-2 gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                                                    {metadata.clubBadgeUrl && (
                                                        <div className="relative w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 shrink-0">
                                                            <NextImage
                                                                src={metadata.clubBadgeUrl}
                                                                alt=""
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="whitespace-nowrap">{metadata.clubName}</span>
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                                {isClub && (
                                    <>
                                        {metadata?.stadium && (
                                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                                <MapPin className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-slate-400 dark:text-neutral-500" />
                                                <span className="whitespace-nowrap font-medium">{metadata.stadium}</span>
                                            </div>
                                        )}
                                        {metadata?.founded && (
                                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                                <Calendar className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 text-slate-400 dark:text-neutral-500" />
                                                <span className="whitespace-nowrap font-medium">Est. {metadata.founded}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Balanced spacing */}
                <div className="relative z-10 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-neutral-400 text-xs sm:text-sm">
                        <MessageSquare className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5 shrink-0" />
                        <span className="whitespace-nowrap font-medium">{postCount.toLocaleString()} {postCount === 1 ? 'Take' : 'Takes'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold">
                        <Activity className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5 shrink-0" />
                        <span className="whitespace-nowrap">#3 Trending</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
