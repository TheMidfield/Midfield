"use client";

import { useEffect, useState, memo } from "react";
import { TrendingUp, Shield, Trophy, User } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { getTrendingTopicsData, type TrendingTopic } from "@/app/actions/fetch-widget-data";
import { PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";

// Skeleton for loading state
const SkeletonItem = memo(({ index }: { index: number }) => (
    <div className="flex items-center gap-3 py-2 animate-pulse">
        <span className="text-sm font-bold w-5 text-slate-200 dark:text-neutral-700 tabular-nums text-center">
            {index}
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0" />
        <div className="flex-1 min-w-0">
            <div className="h-3.5 bg-slate-200 dark:bg-neutral-700 rounded w-3/4" />
        </div>
    </div>
));
SkeletonItem.displayName = 'SkeletonItem';

// Get appropriate fallback icon based on entity type
const EntityFallbackIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'player':
            return <User className="w-4 h-4 text-slate-400 dark:text-neutral-500" />;
        case 'league':
            return <Trophy className="w-4 h-4 text-slate-400 dark:text-neutral-500" />;
        default:
            return <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />;
    }
};

// Memoized trending item
const TrendingItem = memo(({ item }: { item: TrendingTopic }) => {
    const isPlayer = item.type === 'player';
    const isClubOrLeague = item.type === 'club' || item.type === 'league';

    return (
        <Link href={`/topic/${item.slug}`} className="block group">
            <div className="flex items-center gap-2 py-2 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/50 px-3">
                {/* Rank number - centered with fixed width */}
                <span className={`text-sm font-bold w-5 tabular-nums text-center transition-colors ${item.rank <= 3
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-neutral-500'
                    }`}>
                    {item.rank}
                </span>

                {/* Avatar - consistent styling for all entity types */}
                <div className={`relative w-8 h-8 shrink-0 flex items-center justify-center ${isPlayer
                    ? 'bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-700'
                    : ''
                    }`}>
                    {item.imageUrl ? (
                        <NextImage
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="32px"
                            unoptimized={true}
                            className={isPlayer ? '' : 'object-contain'}
                            {...(isPlayer ? PLAYER_IMAGE_STYLE : {})}
                        />
                    ) : (
                        <EntityFallbackIcon type={item.type} />
                    )}
                </div>

                {/* Title */}
                <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 dark:text-neutral-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                </span>
            </div>
        </Link>
    );
});
TrendingItem.displayName = 'TrendingItem';

export function TrendingWidget() {
    const [trending, setTrending] = useState<TrendingTopic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        getTrendingTopicsData()
            .then((data) => {
                if (mounted) {
                    setTrending(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to fetch trending:", err);
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 dark:text-emerald-400" />
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-neutral-100">
                        Trending
                    </h3>
                </div>
                <div className="space-y-0.5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <SkeletonItem key={i} index={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (trending.length === 0) return null;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-sm">
            {/* Header - green icon */}
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-neutral-100">
                    Trending
                </h3>
            </div>

            {/* List - improved spacing */}
            <div className="space-y-0.5">
                {trending.map((item) => (
                    <TrendingItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
