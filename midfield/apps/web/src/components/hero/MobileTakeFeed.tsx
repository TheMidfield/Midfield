"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import NextImage from "next/image";
import { Card } from "@/components/ui/Card";
import { PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";
import { useHeroTakes } from "@/lib/hooks/use-cached-data";
import { createClient } from "@/lib/supabase/client";
import type { HeroTake } from "@/app/actions/hero-data";

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

// Mobile-optimized Take Card (simpler, more compact)
function MobileTakeCard({ take }: { take: HeroTake }) {
    const isPlayer = take.topic.type === 'player';
    const isClub = take.topic.type === 'club';
    const isLeague = take.topic.type === 'league';

    return (
        <Link href={`/topic/${take.topic.slug}`} className="block group">
            <Card variant="interactive" className="p-2.5 flex flex-col gap-1.5">
                {/* Header: Entity + Time */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`relative shrink-0 overflow-hidden ${isPlayer ? 'w-4 h-4 rounded-full border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800' : 'w-4 h-4'}`}>
                            {take.topic.imageUrl ? (
                                <>
                                    {/* Light mode image */}
                                    <NextImage
                                        src={take.topic.imageUrl}
                                        alt={take.topic.title}
                                        fill
                                        sizes="16px"
                                        className={(isClub || isLeague) ? 'object-contain p-0.5 dark:hidden' : PLAYER_IMAGE_STYLE.className}
                                        {...(isPlayer ? PLAYER_IMAGE_STYLE : {})}
                                        unoptimized={true}
                                        onError={(e) => {
                                            console.error('[Mobile] Image failed to load:', take.topic.imageUrl, 'for', take.topic.title, 'type:', take.topic.type);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    {/* Dark mode image (for leagues) */}
                                    {isLeague && (
                                        <NextImage
                                            src={take.topic.imageDarkUrl || take.topic.imageUrl}
                                            alt={take.topic.title}
                                            fill
                                            sizes="16px"
                                            unoptimized={true}
                                            className="object-contain p-0.5 hidden dark:block"
                                            onError={(e) => {
                                                console.error('[Mobile Dark] Image failed to load:', take.topic.imageDarkUrl || take.topic.imageUrl);
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center">
                                    <span className="text-[6px] opacity-50">#</span>
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 truncate group-active:text-emerald-600 dark:group-active:text-emerald-400 transition-colors">
                            {take.topic.title}
                        </span>
                    </div>
                    <span className="text-slate-400 dark:text-neutral-500 text-[9px] font-medium shrink-0">
                        {timeAgo(take.createdAt)}
                    </span>
                </div>

                {/* Content */}
                <p className="text-slate-700 dark:text-neutral-300 text-xs leading-snug font-medium line-clamp-3">
                    {take.content}
                </p>

                {/* Footer: Author */}
                <div className="flex items-center gap-1">
                    <div className="shrink-0 rounded bg-slate-100 dark:bg-neutral-800 overflow-hidden w-3.5 h-3.5 border border-slate-200 dark:border-neutral-700">
                        {take.author.avatarUrl ? (
                            <NextImage
                                src={take.author.avatarUrl}
                                alt=""
                                width={14}
                                height={14}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-neutral-500 font-bold text-[6px]">
                                {take.author.username.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-500 font-medium text-[10px]">
                        @{take.author.username}
                    </span>
                </div>
            </Card>
        </Link>
    );
}

/**
 * MobileTakeFeed - Lightweight take feed for mobile
 * Uses the same SWR hook as LiveFeed with realtime subscriptions
 * Displays as horizontal scroll carousel with delayed pop-in animation for last 2 cards
 */
export function MobileTakeFeed() {
    const { data: swrTakes, isLoading: loading, mutate } = useHeroTakes(6);
    const [takes, setTakes] = useState<HeroTake[]>([]);
    const [visibleCards, setVisibleCards] = useState<number>(0);
    const [animatingCardIndices, setAnimatingCardIndices] = useState<Set<number>>(new Set());
    const hasInitialAnimationRun = useRef(false);
    const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

    // Initialize Supabase client
    useEffect(() => {
        supabaseRef.current = createClient();
    }, []);

    // Update takes when SWR data changes
    useEffect(() => {
        if (swrTakes) {
            setTakes(swrTakes);
        }
    }, [swrTakes]);

    // Supabase Realtime subscription for instant updates (same as desktop)
    useEffect(() => {
        if (!supabaseRef.current) return;

        const channel = supabaseRef.current
            .channel('public:posts:mobile')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'posts',
                    filter: 'is_deleted=eq.false'
                },
                async (payload) => {
                    console.log('New take detected (mobile):', payload);
                    // Delay to ensure DB propagation
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

    // Staggered reveal animation - first 4 cards instant, then 2 with 1.5s delays
    useEffect(() => {
        console.debug('[MobileAnimation] Effect triggered:', { takesLength: takes?.length, loading, hasRun: hasInitialAnimationRun.current });

        if (!takes || takes.length === 0 || loading) {
            console.debug('[MobileAnimation] Skipping - no takes or loading');
            return;
        }

        // Animation already ran - just show all cards
        if (hasInitialAnimationRun.current) {
            console.debug('[MobileAnimation] Animation already ran, showing all cards');
            setVisibleCards(takes.length);
            return;
        }

        console.debug('[MobileAnimation] Starting first-time animation');

        // First-time animation setup
        setVisibleCards(0);
        setAnimatingCardIndices(new Set([4, 5]));

        const timers: NodeJS.Timeout[] = [];

        // After 50ms, show first 4 cards instantly
        timers.push(setTimeout(() => {
            console.debug('[MobileAnimation] Showing first 4 cards');
            setVisibleCards(Math.min(4, takes.length));
        }, 50));

        // After 1.5s, show card 5 with animation
        if (takes.length >= 5) {
            timers.push(setTimeout(() => {
                console.debug('[MobileAnimation] Showing card 5 with animation');
                setVisibleCards(5);
            }, 1550));
        }

        // After 3s, show card 6 with animation
        if (takes.length >= 6) {
            timers.push(setTimeout(() => {
                console.debug('[MobileAnimation] Showing card 6 with animation');
                setVisibleCards(6);
                hasInitialAnimationRun.current = true;
                setTimeout(() => setAnimatingCardIndices(new Set()), 500);
            }, 3050));
        } else {
            // Mark complete after last card
            timers.push(setTimeout(() => {
                console.debug('[MobileAnimation] Animation complete');
                hasInitialAnimationRun.current = true;
                setAnimatingCardIndices(new Set());
            }, takes.length >= 5 ? 2050 : 100));
        }

        return () => {
            console.debug('[MobileAnimation] Cleaning up timers');
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [takes, loading]);

    if (loading) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <span className="font-display font-semibold text-sm text-slate-900 dark:text-neutral-100">Latest Takes</span>
                </div>
                <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="shrink-0 w-[220px] bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-md p-2.5 animate-pulse">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-neutral-700" />
                                <div className="h-3 w-20 bg-slate-200 dark:bg-neutral-700 rounded" />
                            </div>
                            <div className="space-y-1">
                                <div className="h-2.5 w-full bg-slate-200 dark:bg-neutral-700 rounded" />
                                <div className="h-2.5 w-3/4 bg-slate-200 dark:bg-neutral-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!takes || takes.length === 0) return null;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-display font-semibold text-sm text-slate-900 dark:text-neutral-100">Latest Takes</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                    <Sparkles className="w-3 h-3" />
                    Post a take and see it here
                </span>
            </div>

            {/* Horizontal scroll container with staggered animation */}
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {takes.map((take, index) => {
                        // Only show if visible based on staggered reveal
                        if (index >= visibleCards) return null;

                        // First 4 cards (0-3): no animation, just appear
                        // Cards 5-6 (indices 4-5): animated pop-in
                        const shouldAnimate = animatingCardIndices.has(index);

                        return (
                            <motion.div
                                key={take.id}
                                className="shrink-0 w-[220px] snap-start"
                                initial={shouldAnimate ? { opacity: 0, x: -30, scale: 0.94 } : false}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={shouldAnimate ? {
                                    opacity: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                                    x: { type: 'spring', stiffness: 400, damping: 28 },
                                    scale: { type: 'spring', stiffness: 450, damping: 25 },
                                } : undefined}
                            >
                                <MobileTakeCard take={take} />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
