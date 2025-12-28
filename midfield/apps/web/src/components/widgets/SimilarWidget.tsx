"use client";

import { useState, useEffect, memo } from "react";
import { Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { getSimilarTopicsData, type SimilarEntity } from "@/app/actions/fetch-widget-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLAYER_IMAGE_STYLE } from "@/components/FeaturedPlayers";

// Position info with colors - matches TopicPageClient
const getPositionInfo = (pos: string) => {
    const normalized = pos?.toLowerCase().trim() || "";
    if (normalized.includes("manager") || normalized.includes("coach"))
        return { abbr: "MGR", color: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400" };
    if (normalized.includes("goalkeeper") || normalized.includes("goal keeper") || normalized === "gk")
        return { abbr: "GK", color: "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400" };
    if (normalized.includes("centre-back") || normalized.includes("center-back") || normalized.includes("centre back") || normalized.includes("center back") || normalized === "cb")
        return { abbr: "CB", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400" };
    if (normalized.includes("left-back") || normalized.includes("left back") || normalized === "lb")
        return { abbr: "LB", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400" };
    if (normalized.includes("right-back") || normalized.includes("right back") || normalized === "rb")
        return { abbr: "RB", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400" };
    if (normalized.includes("back") || normalized.includes("defender"))
        return { abbr: "DEF", color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400" };
    if (normalized.includes("defensive midfield") || normalized.includes("holding midfield") || normalized === "cdm" || normalized === "dm")
        return { abbr: "CDM", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" };
    if (normalized.includes("attacking midfield") || normalized === "cam" || normalized === "am")
        return { abbr: "CAM", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" };
    if (normalized.includes("central midfield") || normalized.includes("centre midfield") || normalized === "cm")
        return { abbr: "CM", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" };
    if (normalized.includes("midfield"))
        return { abbr: "MID", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" };
    if (normalized.includes("left wing") || normalized.includes("left-wing") || normalized === "lw")
        return { abbr: "LW", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400" };
    if (normalized.includes("right wing") || normalized.includes("right-wing") || normalized === "rw")
        return { abbr: "RW", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400" };
    if (normalized.includes("striker") || normalized.includes("centre-forward") || normalized.includes("center-forward") || normalized === "st" || normalized === "cf")
        return { abbr: "ST", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400" };
    if (normalized.includes("wing") || normalized.includes("forward") || normalized.includes("winger"))
        return { abbr: "FWD", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400" };
    return { abbr: pos?.substring(0, 3).toUpperCase() || "?", color: "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400" };
};

// Rating color helper - matches TopicPageClient
const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (rating >= 70) return 'text-emerald-700/80 dark:text-emerald-600';
    if (rating >= 60) return 'text-yellow-600 dark:text-yellow-500';
    if (rating >= 50) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-600 dark:text-red-500';
};

// Memoized Skeleton Card
const SkeletonCard = memo(() => (
    <div className="p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg animate-pulse">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3.5 bg-slate-200 dark:bg-neutral-700 rounded w-3/4" />
            <div className="flex gap-1.5">
                <div className="h-4 w-8 bg-slate-200 dark:bg-neutral-700 rounded" />
                <div className="h-4 w-6 bg-slate-200 dark:bg-neutral-700 rounded" />
            </div>
        </div>
    </div>
));
SkeletonCard.displayName = 'SkeletonCard';

// Memoized Similar Item
const SimilarItem = memo(({ entity }: { entity: SimilarEntity }) => {
    const isPlayer = entity.type === 'player';
    const isClub = entity.type === 'club';
    const posInfo = isPlayer && entity.subtitle ? getPositionInfo(entity.subtitle) : null;

    return (
        <Link href={`/topic/${entity.slug}`} className="block">
            <Card variant="interactive" className="p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 group hover:border-emerald-500/30 transition-all">
                {/* Avatar */}
                {isPlayer ? (
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 dark:border-neutral-700">
                        {entity.imageUrl ? (
                            <NextImage
                                src={entity.imageUrl}
                                alt={entity.title}
                                fill
                                sizes="40px"
                                {...PLAYER_IMAGE_STYLE}
                            />
                        ) : (
                            <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                        )}
                    </div>
                ) : (
                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                        {entity.imageUrl ? (
                            <NextImage
                                src={entity.imageUrl}
                                alt={entity.title}
                                fill
                                sizes="36px"
                                className="object-contain"
                            />
                        ) : (
                            <Shield className="w-full h-full text-slate-300 dark:text-neutral-600" />
                        )}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {entity.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {isPlayer && posInfo && (
                            <Badge variant="secondary" className={`text-[8px] px-1 h-4 ${posInfo.color}`}>
                                {posInfo.abbr}
                            </Badge>
                        )}
                        {isPlayer && entity.rating && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                <span className={`font-black ${getRatingColor(entity.rating)}`}>{entity.rating}</span>
                            </Badge>
                        )}
                        {isClub && entity.subtitle && (
                            <Badge variant="secondary" className="text-[8px] px-1.5 h-4 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 truncate max-w-[120px]">
                                {entity.subtitle}
                            </Badge>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
});
SimilarItem.displayName = 'SimilarItem';

export function SimilarWidget({ slug }: { slug?: string }) {
    const [data, setData] = useState<SimilarEntity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        
        if (slug) {
            getSimilarTopicsData(slug)
                .then((res) => {
                    if (mounted) {
                        setData(res);
                        setLoading(false);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch similar:", err);
                    if (mounted) setLoading(false);
                });
        } else {
            setLoading(false);
        }

        return () => { mounted = false; };
    }, [slug]);

    if (!slug) return null;

    // Show skeleton loading state
    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                        <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                        Similar
                    </h3>
                </div>
                <div className="space-y-2">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    if (data.length === 0) return null;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                    <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    Similar
                </h3>
            </div>

            {/* List - Using memoized SimilarItem */}
            <div className="space-y-2">
                {data.map((entity) => (
                    <SimilarItem key={entity.id} entity={entity} />
                ))}
            </div>
        </div>
    );
}
