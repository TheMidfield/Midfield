"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";
import { getHeroTakes, type HeroTake } from "@/app/actions/hero-data";
import Link from "next/link";

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

    return (
        <Link href={`/topic/${take.topic.slug}`} className="block group">
            <article
                className="bg-neutral-900/50 border border-neutral-800 rounded-md hover:border-emerald-500/30 transition-all p-4 hover:bg-neutral-900/80 group-hover:-translate-y-0.5"
            >
                {/* Header: Topic Context */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 bg-neutral-800/50 rounded-md px-2 py-1 border border-neutral-800 transition-colors group-hover:border-neutral-700">
                        {take.topic.imageUrl && (
                            <img
                                src={take.topic.imageUrl}
                                alt=""
                                className={`w-4 h-4 ${isPlayer ? 'object-cover object-top' : 'object-contain'}`}
                            />
                        )}
                        <span className="text-white text-xs font-bold">
                            {take.topic.title}
                        </span>
                    </div>
                    <span className="text-neutral-500 text-[10px] font-mono">
                        {timeAgo(take.createdAt)}
                    </span>
                </div>

                {/* Content */}
                <p className="text-neutral-300 text-sm leading-relaxed mb-4 line-clamp-3 font-medium">
                    {take.content}
                </p>

                {/* Footer: Author & Reactions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50">
                    <div className="flex items-center gap-2">
                        {/* Avatar - Rounded MD (Square-ish) */}
                        <div className="shrink-0 rounded-md bg-neutral-800 overflow-hidden w-6 h-6 border border-neutral-700">
                            {take.author.avatarUrl ? (
                                <img src={take.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 font-bold text-[8px]">
                                    {take.author.username.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className="text-neutral-400 font-semibold text-xs group-hover:text-emerald-400 transition-colors">
                            @{take.author.username}
                        </span>
                    </div>

                    {take.reactionCount > 0 && (
                        <div className="flex items-center gap-1.5 text-neutral-500 bg-neutral-800/30 px-1.5 py-0.5 rounded text-[10px]">
                            <span>❤️</span>
                            <span className="font-mono">{take.reactionCount}</span>
                        </div>
                    )}
                </div>
            </article>
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
        getHeroTakes(8)
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
            <div className="flex items-center gap-2 mb-4 pl-1">
                <Flame className="text-emerald-500 w-4 h-4 fill-emerald-500/20" />
                <span className="font-extrabold text-slate-300 dark:text-neutral-200 text-xs uppercase tracking-widest">
                    Latest Takes
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
                        <AnimatePresence initial={false}>
                            {col1.map((take) => (
                                <motion.div
                                    key={take.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TakeCard take={take} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Column 2 - Offset/Staggered */}
                <div className="flex-1 flex flex-col gap-4 pt-16">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        <AnimatePresence initial={false}>
                            {col2.map((take) => (
                                <motion.div
                                    key={take.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <TakeCard take={take} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
