"use client";

import Link from "next/link";
import NextImage from "next/image";
import { ChevronRight, Share2, MapPin, Calendar, Flag, Ruler, Hash, Activity, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PLAYER_IMAGE_STYLE } from "@/components/FeaturedPlayers";
import { AuthModal } from "@/components/ui/AuthModal";
import { useAuthModal } from "@/components/ui/useAuthModal";
import { voteTopic } from "@/app/actions/vote-topic";
import { useState } from "react";

interface EntityHeaderProps {
    title: string;
    type: "club" | "player" | "league";
    imageUrl?: string;
    badgeUrl?: string;
    badgeUrlDark?: string;
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
        render_url?: string;
        trophy_url?: string;
        fc26?: { overall?: string | number };
        fc26_data?: any; // FC26 data from dedicated column
    };
    backHref?: string;
    userId?: string;
    topicId?: string; // Topic ID for voting
    upvoteCount?: number; // Initial upvote count
    downvoteCount?: number; // Initial downvote count
    userVote?: 'upvote' | 'downvote' | null; // User's current vote
}

export function EntityHeader({
    title,
    type,
    imageUrl,
    badgeUrl,
    badgeUrlDark,
    postCount = 0,
    metadata,
    backHref = "/",
    userId,
    topicId,
    upvoteCount: initialUpvoteCount = 0,
    downvoteCount: initialDownvoteCount = 0,
    userVote: initialUserVote = null,
}: EntityHeaderProps) {
    // Auth modal management
    const { isAuthModalOpen, authModalContext, requireAuth, closeAuthModal } = useAuthModal();
    const isAuthenticated = !!userId;

    // Voting state
    const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
    const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount);
    const [userVote, setUserVote] = useState(initialUserVote);

    // Handle vote - instant optimistic update
    const handleVote = async (voteType: 'upvote' | 'downvote') => {
        if (!requireAuth(isAuthenticated, "default")) return;
        if (!topicId) return;

        // Store previous state for potential rollback
        const previousUserVote = userVote;
        const previousUpvoteCount = upvoteCount;
        const previousDownvoteCount = downvoteCount;

        // Instant optimistic update
        if (previousUserVote === voteType) {
            // Remove vote
            setUserVote(null);
            if (voteType === 'upvote') {
                setUpvoteCount(prev => Math.max(0, prev - 1));
            } else {
                setDownvoteCount(prev => Math.max(0, prev - 1));
            }
        } else {
            // Add or change vote
            setUserVote(voteType);
            if (voteType === 'upvote') {
                setUpvoteCount(prev => prev + 1);
                if (previousUserVote === 'downvote') {
                    setDownvoteCount(prev => Math.max(0, prev - 1));
                }
            } else {
                setDownvoteCount(prev => prev + 1);
                if (previousUserVote === 'upvote') {
                    setUpvoteCount(prev => Math.max(0, prev - 1));
                }
            }
        }

        // Fire-and-forget server update (no loading state)
        voteTopic(topicId, voteType).then(result => {
            if (!result.success) {
                // Silently revert on error
                setUserVote(previousUserVote);
                setUpvoteCount(previousUpvoteCount);
                setDownvoteCount(previousDownvoteCount);
            }
        }).catch(() => {
            // Silently revert on error
            setUserVote(previousUserVote);
            setUpvoteCount(previousUpvoteCount);
            setDownvoteCount(previousDownvoteCount);
        });
    };

    const isPlayer = type === "player";
    const isClub = type === "club";
    const isLeague = type === "league";
    const displayImage = isPlayer ? imageUrl : badgeUrl;

    // Watermark image: use render for players, trophy for leagues, badge for clubs
    const watermarkImage = isPlayer
        ? (metadata?.render_url || imageUrl)
        : isLeague
            ? metadata?.trophy_url
            : badgeUrl;

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

    // On mobile, collapse middle breadcrumbs if more than 3 items
    const getMobileBreadcrumbs = (): Array<{ label: string; href: string | null; isEllipsis?: boolean }> => {
        if (breadcrumbs.length <= 3) return breadcrumbs;
        // Show: first, "...", last two
        return [
            breadcrumbs[0],
            { label: "...", href: null, isEllipsis: true },
            breadcrumbs[breadcrumbs.length - 2],
            breadcrumbs[breadcrumbs.length - 1]
        ];
    };

    return (
        <>
            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                context={authModalContext}
            />

            <div className="mb-4 sm:mb-6">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm pb-1">
                    {/* Mobile: collapsed breadcrumbs */}
                    <div className="flex sm:hidden items-center gap-1 min-w-0">
                        {getMobileBreadcrumbs().map((crumb, idx) => (
                            <div key={idx} className="flex items-center gap-0.5 shrink-0">
                                {idx > 0 && (
                                    <ChevronRight className="w-2 h-2 text-slate-300 dark:text-neutral-600 shrink-0" />
                                )}
                                {crumb.isEllipsis ? (
                                    <span className="px-1 text-slate-400 dark:text-neutral-500 text-[9px]">...</span>
                                ) : crumb.href ? (
                                    <Link href={crumb.href}>
                                        <Button variant="ghost" size="sm" className="h-5 px-1 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 text-[9px] whitespace-nowrap transition-colors">
                                            {crumb.label}
                                        </Button>
                                    </Link>
                                ) : (
                                    <span className="px-1 font-semibold text-slate-900 dark:text-neutral-100 text-[10px] truncate max-w-[100px]">
                                        {crumb.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Desktop: full breadcrumbs */}
                    <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={idx} className="flex items-center gap-1 md:gap-1.5 shrink-0">
                                {idx > 0 && (
                                    <ChevronRight className="w-2.5 md:w-3 h-2.5 md:h-3 text-slate-300 dark:text-neutral-600 shrink-0" />
                                )}
                                {crumb.href ? (
                                    <Link href={crumb.href}>
                                        <Button variant="ghost" size="sm" className="h-6 md:h-7 px-1.5 md:px-2 text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 text-[10px] md:text-xs whitespace-nowrap transition-colors">
                                            {crumb.label}
                                        </Button>
                                    </Link>
                                ) : (
                                    <span className="px-1.5 md:px-2 font-semibold text-slate-900 dark:text-neutral-100 text-xs md:text-sm truncate max-w-[130px] md:max-w-none">
                                        {crumb.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Hero Card */}
                <Card className="relative overflow-hidden bg-white dark:bg-neutral-900">
                    {/* Background Watermark */}
                    {watermarkImage && (
                        <div className={`absolute pointer-events-none select-none ${isPlayer
                            ? 'right-8 sm:right-12 md:right-16 top-3 sm:top-4 md:top-5 w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 opacity-[0.12]'
                            : 'right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 opacity-[0.08] rotate-12'
                            }`}>
                            <NextImage
                                src={watermarkImage}
                                alt=""
                                fill
                                className={`object-contain ${isPlayer ? 'scale-[1.6]' : 'scale-[0.9]'}`}
                                style={isPlayer ? {
                                    objectPosition: '50% 0%',
                                    transformOrigin: '50% 0%'
                                } : {
                                    objectPosition: 'center',
                                    transformOrigin: 'center'
                                }}
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

                                    </div>
                                ) : (
                                    // Badge for clubs and leagues
                                    <div className="pl-1 sm:pl-2 md:pl-3 lg:pl-4 py-4 sm:py-5 md:py-8 lg:py-10 relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                                        {isLeague ? (
                                            // League - Show logo with theme switching
                                            <>
                                                {badgeUrl && (
                                                    <img
                                                        src={badgeUrl}
                                                        alt={title}
                                                        className="absolute inset-0 w-full h-full object-contain p-1 sm:p-1.5 dark:hidden"
                                                    />
                                                )}
                                                {(badgeUrlDark || badgeUrl) && (
                                                    <img
                                                        src={badgeUrlDark || badgeUrl}
                                                        alt={title}
                                                        className="absolute inset-0 w-full h-full object-contain p-1 sm:p-1.5 hidden dark:block"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            // Club badge
                                            badgeUrl && (
                                                <NextImage
                                                    src={badgeUrl}
                                                    alt={title}
                                                    fill
                                                    className="object-contain p-1 sm:p-1.5"
                                                    sizes="(max-width: 640px) 56px, (max-width: 768px) 80px, 112px"
                                                    priority
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Info - Unified padding for both types */}
                            <div className="flex-1 min-w-0 pr-2.5 sm:pr-4 md:pr-6 py-3 sm:py-4 md:py-5 flex flex-col justify-center">

                                {/* Row 1: Title + Share Button */}
                                <div className="flex items-center justify-between gap-3 sm:gap-4 mb-1.5 sm:mb-2 md:mb-2.5">
                                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-slate-900 dark:text-neutral-100 leading-tight truncate">
                                        {title}
                                    </h1>

                                    {/* Share Button - Square */}
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-md transition-colors shrink-0">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Row 2: Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 md:mb-2.5">
                                    {/* Show Manager badge if position is Manager/Coach, otherwise show Player badge */}
                                    {isPlayer && (
                                        metadata?.position?.toLowerCase().includes('manager') || metadata?.position?.toLowerCase().includes('coach') ? (
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 h-[22px] sm:h-auto px-2.5 sm:px-2.5 py-0.5 sm:py-1 capitalize">
                                                Manager
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize h-[22px] sm:h-auto px-2.5 sm:px-2.5 py-0.5 sm:py-1">
                                                {type}
                                            </Badge>
                                        )
                                    )}
                                    {!isPlayer && (
                                        <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize h-[22px] sm:h-auto px-2.5 sm:px-2.5 py-0.5 sm:py-1">
                                            {type}
                                        </Badge>
                                    )}
                                    {isPlayer && metadata?.position && !(metadata.position.toLowerCase().includes('manager') || metadata.position.toLowerCase().includes('coach')) && (
                                        <Badge variant="secondary" className="text-[10px] sm:text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 h-[22px] sm:h-auto px-2.5 sm:px-2.5 py-0.5 sm:py-1">
                                            {metadata.position}
                                        </Badge>
                                    )}
                                    {isClub && metadata?.league && (
                                        <Link href={`/leagues/${metadata.leagueSlug || metadata.league.toLowerCase().replace(/\s+/g, '-')}`}>
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs h-[22px] sm:h-auto px-2.5 sm:px-2.5 py-0.5 sm:py-1 hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors">
                                                {metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                            </Badge>
                                        </Link>
                                    )}

                                </div>

                                {/* Row 3: Stats */}
                                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 md:gap-x-5 lg:gap-x-6 gap-y-1.5 text-[11px] sm:text-xs md:text-sm text-slate-500 dark:text-neutral-400">
                                    {isPlayer && (
                                        <>
                                            {metadata?.clubName && (
                                                <Link href={`/topic/${metadata.clubSlug || metadata.clubName.toLowerCase().replace(/\s+/g, '-')}`} className="shrink-0">
                                                    <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                                                        {metadata.clubBadgeUrl && (
                                                            <div className="relative w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 shrink-0">
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

                    {/* Footer - Opaque background to block watermark */}
                    <div className="relative z-20 bg-white dark:bg-neutral-900 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 border-t-2 border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-neutral-400 text-[11px] sm:text-xs md:text-sm">
                            <MessageSquare className="w-3.5 sm:w-4 md:w-[18px] h-3.5 sm:h-4 md:h-[18px] shrink-0" />
                            <span className="whitespace-nowrap font-medium">{postCount.toLocaleString()} {postCount === 1 ? 'Take' : 'Takes'}</span>
                        </div>

                        {/* Upvote/Downvote */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Upvote */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleVote('upvote');
                                }}
                                className={`group flex items-center gap-1.5 px-3 py-2 rounded-md border-2 transition-all cursor-pointer ${userVote === 'upvote'
                                    ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-950/30'
                                    : 'border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-neutral-900 hover:border-emerald-500 dark:hover:border-emerald-500'
                                    }`}
                            >
                                <ThumbsUp className={`w-4 h-4 transition-transform ${userVote === 'upvote'
                                    ? 'text-emerald-600 dark:text-emerald-500'
                                    : 'text-emerald-600 dark:text-emerald-500 group-hover:scale-110'
                                    }`} />
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 min-w-[2ch] text-center">{upvoteCount}</span>
                            </button>

                            {/* Downvote */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleVote('downvote');
                                }}
                                className={`group flex items-center gap-1.5 px-3 py-2 rounded-md border-2 transition-all cursor-pointer ${userVote === 'downvote'
                                    ? 'border-red-500 dark:border-red-500 bg-red-100 dark:bg-red-950/30'
                                    : 'border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-neutral-900 hover:border-red-500 dark:hover:border-red-500'
                                    }`}
                            >
                                <ThumbsDown className={`w-4 h-4 transition-transform ${userVote === 'downvote'
                                    ? 'text-red-600 dark:text-red-500'
                                    : 'text-red-600 dark:text-red-500 group-hover:scale-110'
                                    }`} />
                                <span className="text-xs font-bold text-red-700 dark:text-red-400 min-w-[2ch] text-center">{downvoteCount}</span>
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
