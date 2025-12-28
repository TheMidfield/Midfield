"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
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

// Get topic color
function getTopicStyle(type: string) {
    switch (type) {
        case 'player': return 'text-emerald-600 dark:text-emerald-400';
        case 'club': return 'text-blue-600 dark:text-blue-400';
        case 'league': return 'text-purple-600 dark:text-purple-400';
        default: return 'text-emerald-600 dark:text-emerald-400';
    }
}

// Compact Take Card
function TakeCard({ take }: { take: HeroTake }) {
    const topicColor = getTopicStyle(take.topic.type);
    const isPlayer = take.topic.type === 'player';

    return (
        <Link href={`/topic/${take.topic.slug}`} className="block group">
            <article
                className="bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 rounded-md hover:border-slate-300 dark:hover:border-neutral-700 transition-colors"
                style={{ padding: '10px 12px' }}
            >
                {/* Header: Topic + Time */}
                <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                    <div className="flex items-center" style={{ gap: '6px', minWidth: 0, flex: 1 }}>
                        {/* Topic image */}
                        {take.topic.imageUrl && (
                            <div
                                className={`shrink-0 overflow-hidden ${isPlayer ? 'rounded-full' : ''}`}
                                style={{ width: '16px', height: '16px' }}
                            >
                                <img
                                    src={take.topic.imageUrl}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: isPlayer ? 'cover' : 'contain',
                                        objectPosition: isPlayer ? 'top' : 'center'
                                    }}
                                />
                            </div>
                        )}
                        <span
                            className={`font-bold uppercase tracking-wide truncate ${topicColor}`}
                            style={{ fontSize: '9px' }}
                        >
                            {take.topic.title}
                        </span>
                    </div>
                    <span className="text-slate-400 dark:text-neutral-500 shrink-0" style={{ fontSize: '9px' }}>
                        {timeAgo(take.createdAt)}
                    </span>
                </div>

                {/* Content */}
                <p
                    className="text-slate-700 dark:text-neutral-300 line-clamp-2"
                    style={{ fontSize: '12px', lineHeight: 1.4, marginBottom: '6px' }}
                >
                    {take.content}
                </p>

                {/* Footer: Author */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center" style={{ gap: '4px' }}>
                        {/* Square avatar per blueprint */}
                        <div
                            className="shrink-0 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden"
                            style={{ width: '14px', height: '14px' }}
                        >
                            {take.author.avatarUrl ? (
                                <img src={take.author.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span className="font-bold text-slate-400" style={{ fontSize: '6px' }}>
                                    {take.author.username.slice(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="text-slate-400 dark:text-neutral-500" style={{ fontSize: '10px' }}>
                            @{take.author.username}
                        </span>
                    </div>
                    {take.reactionCount > 0 && (
                        <span className="text-slate-400" style={{ fontSize: '9px' }}>
                            🔥 {take.reactionCount}
                        </span>
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
 * LiveFeed - Latest takes as compact cards
 */
export function LiveFeed() {
    const [takes, setTakes] = useState<HeroTake[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        getHeroTakes(5)
            .then((data) => { if (mounted) { setTakes(data); setLoading(false); } })
            .catch((err) => { console.error(err); if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div className="flex items-center" style={{ gap: '5px', marginBottom: '10px' }}>
                <Clock className="text-slate-400 dark:text-neutral-500 shrink-0" style={{ width: '11px', height: '11px' }} />
                <span className="font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>
                    Latest Takes
                </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col" style={{ gap: '6px' }}>
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : takes.length === 0 ? (
                    <div className="text-slate-400 dark:text-neutral-500 text-center" style={{ padding: '24px 0', fontSize: '11px' }}>
                        No takes yet. Be the first!
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {takes.map((take) => (
                            <motion.div
                                key={take.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TakeCard take={take} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
