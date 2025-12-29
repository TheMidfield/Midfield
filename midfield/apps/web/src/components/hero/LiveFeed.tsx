"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownWideNarrow, Flame, Sparkles } from "lucide-react";
import { useHeroTakes } from "@/lib/hooks/use-cached-data";
import type { HeroTake } from "@/app/actions/hero-data";
import Link from "next/link";
import NextImage from "next/image";
import { Card } from "@/components/ui/Card";
import { PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";
import { createClient } from "@/lib/supabase/client";

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

// Compact Take Card
function TakeCard({ take }: { take: HeroTake }) {
    const isPlayer = take.topic.type === 'player';
    const isClub = take.topic.type === 'club';

    return (
        <Link href={`/topic/${take.topic.slug}`} className="block group">
            <Card variant="interactive" className="p-3 sm:p-4 hover:border-emerald-500/30 transition-all bg-white dark:bg-neutral-900 flex flex-col gap-2.5 backdrop-blur-sm">
                {/* Header: Entity */}
                <div className="flex items-center gap-1.5">
                    <ArrowDownWideNarrow className="w-3 h-3 text-slate-400 dark:text-neutral-500 shrink-0" />
                    <div className={`relative shrink-0 overflow-hidden ${isPlayer ? 'w-5 h-5 rounded-full border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800' : 'w-5 h-5'}`}>
                        {take.topic.imageUrl ? (
                            <NextImage
                                src={take.topic.imageUrl}
                                alt={take.topic.title}
                                fill
                                sizes="20px"
                                priority={true}
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

                {/* Footer: Author + Time */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-center gap-1.5">
                        <div className="shrink-0 rounded-md bg-slate-100 dark:bg-neutral-800 overflow-hidden w-4 h-4 border border-slate-200 dark:border-neutral-700">
                            {take.author.avatarUrl ? (
                                <NextImage
                                    src={take.author.avatarUrl}
                                    alt=""
                                    width={16}
                                    height={16}
                                    priority={true}
                                    className="w-full h-full object-cover"
                                />
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
        <div className="bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 rounded-md animate-pulse p-3">
            <div className="flex items-center gap-1.5 mb-2">
                <div className="rounded-full bg-slate-200 dark:bg-neutral-700 w-4 h-4" />
                <div className="rounded bg-slate-200 dark:bg-neutral-700 w-16 h-3" />
            </div>
            <div className="rounded bg-slate-200 dark:bg-neutral-700 w-full h-3 mb-1" />
            <div className="rounded bg-slate-200 dark:bg-neutral-700 w-3/4 h-3 mb-2" />
            <div className="flex items-center gap-1">
                <div className="rounded-md bg-slate-200 dark:bg-neutral-700 w-3.5 h-3.5" />
                <div className="rounded bg-slate-200 dark:bg-neutral-700 w-10 h-2" />
            </div>
        </div>
    );
}

// Track which column each take belongs to
type TakeWithColumn = HeroTake & { column: 1 | 2 };

/**
 * LiveFeed - Real-time takes feed with Supabase Realtime
 * Features: SWR caching + 15s polling + Realtime subscriptions + staggered animation
 */
export function LiveFeed() {
    // SWR for initial load + fallback polling (15s)
    const { data: swrTakes, mutate } = useHeroTakes(16);

    const [takes, setTakes] = useState<TakeWithColumn[]>([]);
    const [scrollY, setScrollY] = useState(0);
    const [showFirstTake, setShowFirstTake] = useState(false);
    const [showSecondTake, setShowSecondTake] = useState(false);
    const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

    // Initialize Supabase client
    useEffect(() => {
        supabaseRef.current = createClient();
    }, []);

    // Track if the initial "intro" sequence has completed
    const hasInitialAnimationRun = useRef(false);

    // Handle SWR data updates
    useEffect(() => {
        if (!swrTakes || swrTakes.length < 2) return;

        // Always assign columns: latest → column 1 (left), second → column 2 (right)
        const [latest, secondLatest, ...rest] = swrTakes;

        const staggered: TakeWithColumn[] = [
            { ...latest, column: 1 },
            { ...secondLatest, column: 2 },
            ...rest.map((take, i) => ({
                ...take,
                column: ((i % 2) === 0 ? 1 : 2) as 1 | 2
            }))
        ];

        setTakes(staggered);

        // Logic to handling the intro animation vs live updates:
        // If the intro animation hasn't run yet, we trigger the delayed sequence.
        // If it HAS run, we ensure visibility is ON so new items animate in naturally via AnimatePresence.
        if (!hasInitialAnimationRun.current) {
            // Reset and trigger staggered animation
            setShowFirstTake(false);
            setShowSecondTake(false);

            // Show first take after 1.5 seconds
            const timer1 = setTimeout(() => {
                setShowFirstTake(true);
            }, 1500);

            // Show second take after 3 seconds
            const timer2 = setTimeout(() => {
                setShowSecondTake(true);
                hasInitialAnimationRun.current = true; // Mark intro as complete
            }, 3000);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else {
            // Intro already done, ensure visibility allows immediate rendering
            setShowFirstTake(true);
            setShowSecondTake(true);
        }
    }, [swrTakes]);

    // Supabase Realtime subscription for instant updates
    useEffect(() => {
        if (!supabaseRef.current) return;

        const channel = supabaseRef.current
            .channel('public:posts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'posts',
                    filter: 'is_deleted=eq.false'
                },
                async (payload) => {
                    console.log('New take detected:', payload);
                    // Introduce a delay to ensure DB propagation and avoid race conditions
                    // Also acts as a simple debounce
                    setTimeout(() => {
                        mutate();
                    }, 2000);
                }
            )
            .subscribe();

        return () => {
            supabaseRef.current?.removeChannel(channel);
        };
    }, [mutate]);

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const col1Takes = takes.filter(t => t.column === 1);
    const col2Takes = takes.filter(t => t.column === 2);

    // Loading state
    if (!swrTakes) {
        return (
            <div>
                {/* Header - same as loaded state */}
                <div className="flex items-center gap-2 mb-4 pl-1">
                    <Flame className="text-emerald-500 w-4 h-4 fill-emerald-500/20" />
                    <span className="font-extrabold text-slate-500 dark:text-neutral-200 text-xs uppercase tracking-widest">
                        Latest Takes
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                        <Sparkles className="w-3 h-3" />
                        Post a take and see it here
                    </span>
                </div>

                {/* Skeleton */}
                <div className="flex gap-8">
                    <div className="flex-1 flex flex-col">
                        <SkeletonCard />
                        <div style={{ marginBottom: '12px' }} />
                        <SkeletonCard />
                        <div style={{ marginBottom: '12px' }} />
                        <SkeletonCard />
                        <div style={{ marginBottom: '12px' }} />
                        <SkeletonCard />
                    </div>
                    <div className="flex-1 flex flex-col pt-8 sm:pt-12">
                        <SkeletonCard />
                        <div style={{ marginBottom: '12px' }} />
                        <SkeletonCard />
                        <div style={{ marginBottom: '12px' }} />
                        <SkeletonCard />
                        <div style={{ marginBottom: '12px' }} />
                        <SkeletonCard />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pl-1">
                <Flame className="text-emerald-500 w-4 h-4 fill-emerald-500/20" />
                <span className="font-extrabold text-slate-500 dark:text-neutral-200 text-xs uppercase tracking-widest">
                    Latest Takes
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                    <Sparkles className="w-3 h-3" />
                    Post a take and see it here
                </span>
            </div>

            {/* Staggered Grid with Parallax */}
            <div className="flex gap-8">
                {/* Column 1 - Slower parallax */}
                <div
                    className="flex-1 flex flex-col"
                    style={{
                        transform: `translateY(${scrollY * 0.08}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        {col1Takes.map((take, index) => {
                            // Only apply the "wait" logic if this is the very first render sequence
                            // AND we are actually waiting.
                            // If hasInitialAnimationRun is true, we never hide anything.
                            if (!hasInitialAnimationRun.current && index === 0 && !showFirstTake) return null;

                            return (
                                <motion.div
                                    key={take.id}
                                    layout="position"
                                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{
                                        opacity: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                                        y: { type: 'spring', stiffness: 400, damping: 28 },
                                        scale: { type: 'spring', stiffness: 450, damping: 25 },
                                        layout: { type: 'spring', stiffness: 350, damping: 30 }
                                    }}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <TakeCard take={take} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Column 2 - Faster parallax + offset */}
                <div
                    className="flex-1 flex flex-col pt-8 sm:pt-12 pb-48"
                    style={{
                        transform: `translateY(${scrollY * 0.15}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        {col2Takes.map((take, index) => {
                            // Only apply the "wait" logic if this is the very first render sequence
                            // AND we are actually waiting.
                            if (!hasInitialAnimationRun.current && index === 0 && !showSecondTake) return null;

                            return (
                                <motion.div
                                    key={take.id}
                                    layout="position"
                                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{
                                        opacity: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                                        y: { type: 'spring', stiffness: 400, damping: 28 },
                                        scale: { type: 'spring', stiffness: 450, damping: 25 },
                                        layout: { type: 'spring', stiffness: 350, damping: 30 }
                                    }}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <TakeCard take={take} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
