"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, MessageSquare, Sparkles,  } from "lucide-react";
import { getHeroTakes, type HeroTake } from "@/app/actions/hero-data";
import Link from "next/link";
import NextImage from "next/image";
import { Card } from "@/components/ui/Card"; // Use standard Card
import { PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";
import { Badge } from "@/components/ui/Badge";

// Format relative time
function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}

// Compact Take Card - Refined for consistency
function TakeCard({ take }: { take: HeroTake }) {
    const isPlayer = take.topic.type === 'player';
    const isClub = take.topic.type === 'club';

    return (
        <Link href={`/topic/${take.topic.slug}`} className="block group">
            <Card variant="interactive" className="p-3 sm:p-4 hover:border-emerald-500/30 transition-all bg-white dark:bg-neutral-900 flex flex-col gap-2.5 backdrop-blur-sm">
                {/* Header: Entity (Main Focus) */}
                <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-slate-400 dark:text-neutral-500 shrink-0" />
                    <div className={`relative shrink-0 overflow-hidden ${isPlayer ? 'w-5 h-5 rounded-full border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800' : 'w-5 h-5'}`}>
                        {take.topic.imageUrl ? (
                            <NextImage
                                src={take.topic.imageUrl}
                                alt={take.topic.title}
                                fill
                                sizes="20px"
                                className={isClub ? 'object-contain' : PLAYER_IMAGE_STYLE.className}
                                {...(!isClub ? PLAYER_IMAGE_STYLE : {})}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center">
                                <span className="text-[8px] opacity-50">#</span>
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {take.topic.title}
                    </span>
                </div>

                {/* Content */}
                <p className="text-slate-700 dark:text-neutral-300 text-sm leading-snug font-medium line-clamp-4">
                    {take.content}
                </p>

                {/* Footer: Author + Time (De-emphasized) */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-center gap-1.5">
                        <div className="shrink-0 rounded-md bg-slate-100 dark:bg-neutral-800 overflow-hidden w-4 h-4 border border-slate-200 dark:border-neutral-700">
                            {take.author.avatarUrl ? (
                                <img src={take.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-neutral-500 font-bold text-[7px]">
                                    {take.author.username.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-500 font-medium text-[11px]">
                            @{take.author.username}
                        </span>
                    </div>
                    <span className="text-slate-400 dark:text-neutral-500 text-[10px] font-medium">
                        {timeAgo(take.createdAt)}
                    </span>
                </div>
            </Card>
        </Link>
    );
}

// Skeleton
function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 rounded-md animate-pulse" style={{ padding: '10px 12px' }}>
            <div className="flex items-center" style={{ gap: '6px', marginBottom: '6px' }}>
                <div className="rounded-full bg-slate-200 dark:bg-neutral-700" style={{ width: '16px', height: '16px' }} />
                <div className="rounded bg-slate-200 dark:bg-neutral-700" style={{ width: '60px', height: '9px' }} />
            </div>
            <div className="rounded bg-slate-200 dark:bg-neutral-700" style={{ width: '100%', height: '10px', marginBottom: '4px' }} />
            <div className="rounded bg-slate-200 dark:bg-neutral-700" style={{ width: '70%', height: '10px', marginBottom: '6px' }} />
            <div className="flex items-center" style={{ gap: '4px' }}>
                <div className="rounded-md bg-slate-200 dark:bg-neutral-700" style={{ width: '14px', height: '14px' }} />
                <div className="rounded bg-slate-200 dark:bg-neutral-700" style={{ width: '40px', height: '8px' }} />
            </div>
        </div>
    );
}

/**
 * LiveFeed - Latest takes in a staggered dual-column layout
 */
export function LiveFeed() {
    const [takes, setTakes] = useState<HeroTake[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        // Fetch more takes to fill two columns
        getHeroTakes(16)
            .then((data) => { if (mounted) { setTakes(data); setLoading(false); } })
            .catch((err) => { console.error(err); if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    // Split into two columns
    const col1 = takes.filter((_, i) => i % 2 === 0);
    const col2 = takes.filter((_, i) => i % 2 === 1);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-4 pl-1">
                <div className="flex items-center gap-2">
                    <Flame className="text-emerald-500 w-4 h-4 fill-emerald-500/20" />
                    <span className="font-extrabold text-slate-300 dark:text-neutral-200 text-xs uppercase tracking-widest">
                        Latest Takes
                    </span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                    <Sparkles className="w-3 h-3" />
                    Post a take and see it here
                </span>
            </div>

            {/* Staggered Grid */}
            <div className="flex gap-8">
                {/* Column 1 */}
                <div className="flex-1 flex flex-col gap-4">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        // No stagger on load, just clean fade
                        <div className="flex flex-col gap-3">
                            {col1.map((take) => (
                                <TakeCard key={`col1-${take.id}`} take={take} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 2 - Offset/Staggered */}
                <div className="flex-1 flex flex-col gap-3 pt-8 sm:pt-12">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {col2.map((take) => (
                                <TakeCard key={`col2-${take.id}`} take={take} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
