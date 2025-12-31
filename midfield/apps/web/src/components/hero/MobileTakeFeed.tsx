"use client";

import { useState, useEffect } from "react";
import { Flame, ChevronRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PLAYER_IMAGE_STYLE } from "@/lib/entity-helpers";
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

    return (
        <Link href={`/topic/${take.topic.slug}`} className="block">
            <Card variant="interactive" className="p-3 flex flex-col gap-2">
                {/* Header: Entity + Time */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
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
                        <span className="text-sm font-bold text-slate-800 dark:text-neutral-200 truncate">
                            {take.topic.title}
                        </span>
                    </div>
                    <span className="text-slate-400 dark:text-neutral-500 text-[10px] font-medium shrink-0">
                        {timeAgo(take.createdAt)}
                    </span>
                </div>

                {/* Content */}
                <p className="text-slate-700 dark:text-neutral-300 text-sm leading-snug font-medium line-clamp-3">
                    {take.content}
                </p>

                {/* Footer: Author */}
                <div className="flex items-center gap-1.5">
                    <div className="shrink-0 rounded-md bg-slate-100 dark:bg-neutral-800 overflow-hidden w-4 h-4 border border-slate-200 dark:border-neutral-700">
                        {take.author.avatarUrl ? (
                            <NextImage
                                src={take.author.avatarUrl}
                                alt=""
                                width={16}
                                height={16}
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
            </Card>
        </Link>
    );
}

/**
 * MobileTakeFeed - Lightweight take feed for mobile
 * - No parallax (not relevant on mobile)
 * - No real-time updates (performance optimization)
 * - Static list from initial fetch
 * - Horizontal scroll for space efficiency
 */
export function MobileTakeFeed() {
    const [takes, setTakes] = useState<HeroTake[]>([]);
    const [loading, setLoading] = useState(true);

    // Simple one-time fetch for mobile
    useEffect(() => {
        async function fetchTakes() {
            try {
                const res = await fetch('/api/hero-takes?limit=6');
                if (res.ok) {
                    const data = await res.json();
                    setTakes(data.takes || []);
                }
            } catch (e) {
                console.error('Failed to fetch takes:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchTakes();
    }, []);

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <span className="font-display font-semibold text-sm text-slate-900 dark:text-neutral-100">Latest Takes</span>
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-md p-3 animate-pulse">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-700" />
                            <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-700 rounded" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 w-full bg-slate-200 dark:bg-neutral-700 rounded" />
                            <div className="h-3 w-3/4 bg-slate-200 dark:bg-neutral-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (takes.length === 0) return null;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-display font-semibold text-sm text-slate-900 dark:text-neutral-100">Latest Takes</span>
                </div>
                <Link href="/trending">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">
                        See All
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                </Link>
            </div>

            {/* Horizontal scroll container for mobile */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                {takes.map((take) => (
                    <div key={take.id} className="shrink-0 w-[260px] snap-start">
                        <MobileTakeCard take={take} />
                    </div>
                ))}
            </div>
        </div>
    );
}
