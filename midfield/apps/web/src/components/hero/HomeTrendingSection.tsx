"use client";

import { memo } from "react";
import { TrendingUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useTrendingTopics } from "@/lib/hooks/use-cached-data";
import type { TrendingTopic } from "@/app/actions/fetch-widget-data";
import { Badge } from "@/components/ui/Badge";
import { getPositionInfo, getRatingColor, PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";

// Skeleton for loading state
const SkeletonItem = memo(() => (
    <div className="flex items-center gap-3 py-3 pl-4 pr-3 animate-pulse border border-slate-200 dark:border-neutral-800 rounded-md mb-2">
        <span className="text-sm font-bold w-6 text-slate-200 dark:text-neutral-700">•</span>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0" />
        <div className="flex-1 min-w-0">
            <div className="h-4 bg-slate-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
    </div>
));
SkeletonItem.displayName = 'SkeletonItem';

// Trending item with badges
const TrendingItemRow = memo(({ item }: { item: TrendingTopic }) => {
    const isPlayer = item.type === 'player';
    const isClub = item.type === 'club';
    const isLeague = item.type === 'league';
    const posInfo = isPlayer && item.position ? getPositionInfo(item.position) : null;

    return (
        <Link
            href={`/topic/${item.slug}`}
            className="flex items-center gap-2.5 sm:gap-4 py-2.5 sm:py-3 pl-4 sm:pl-6 pr-0 group hover:bg-slate-50 dark:hover:bg-neutral-800/30 transition-colors border border-slate-200 dark:border-neutral-800 rounded-md mb-2 last:mb-0"
        >
            {/* Rank - Top 3 highlighted */}
            <span className={`text-sm font-bold w-6 tabular-nums shrink-0 ${item.rank <= 3
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-neutral-500'
                }`}>
                {item.rank}
            </span>

            {/* Entity Image */}
            <div className={`relative shrink-0 flex items-center justify-center ${isPlayer
                ? 'w-10 h-10 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-700'
                : 'w-10 h-10'
                }`}>
                {item.imageUrl ? (
                    <NextImage
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="40px"
                        className={isPlayer ? '' : 'object-contain'}
                        {...(isPlayer ? PLAYER_IMAGE_STYLE : {})}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-400 dark:text-neutral-500">#</span>
                    </div>
                )}
            </div>

            {/* Title + Badges */}
            <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate mb-1">
                    {item.title}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Player badges */}
                    {isPlayer && posInfo && (
                        <Badge variant="secondary" className={`text-[9px] px-1.5 h-4 ${posInfo.color}`}>
                            {posInfo.abbr}
                        </Badge>
                    )}
                    {isPlayer && item.rating && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5">
                            <span className={`font-black ${getRatingColor(item.rating)}`}>{item.rating}</span>
                        </Badge>
                    )}

                    {/* Club/League badge */}
                    {(isClub || isLeague) && item.league && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 h-4 truncate max-w-[120px]">
                            {item.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                        </Badge>
                    )}

                    {/* Take count */}
                    {item.takeCount > 0 && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            <MessageSquare className="w-2.5 h-2.5" />
                            {item.takeCount}
                        </Badge>
                    )}
                </div>
            </div>
        </Link>
    );
});
TrendingItemRow.displayName = 'TrendingItemRow';

export function HomeTrendingSection() {
    const { data: trending, isLoading: loading } = useTrendingTopics();

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400" />
                <h2 className="font-display font-semibold text-lg sm:text-xl text-slate-900 dark:text-neutral-100">
                    Trending
                </h2>
            </div>

            {/* List - inline style */}
            <div className="space-y-0">
                {loading ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : trending && trending.length > 0 ? (
                    trending.map((item) => (
                        <TrendingItemRow key={item.id} item={item} />
                    ))
                ) : (
                    <div className="text-center py-8 text-sm text-slate-500 dark:text-neutral-500">
                        No trending topics yet
                    </div>
                )}
            </div>
        </div>
    );
}
