"use client";

import { useState, useEffect, useRef } from "react";
import { FeaturedPlayers } from "./FeaturedPlayers";

interface FeaturedPlayersInfiniteProps {
    players: any[];
}

export function FeaturedPlayersInfinite({ players }: FeaturedPlayersInfiniteProps) {
    const [visibleCount, setVisibleCount] = useState(24);
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    const visiblePlayers = players.slice(0, visibleCount);
    const hasMore = visibleCount < players.length;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !isLoading) {
                    setIsLoading(true);
                    // Small delay for smooth UX
                    setTimeout(() => {
                        setVisibleCount((prev) => Math.min(prev + 12, players.length));
                        setIsLoading(false);
                    }, 300);
                }
            },
            { threshold: 0.1 }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader && hasMore) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore, isLoading, players.length]);

    return (
        <div>
            <FeaturedPlayers players={visiblePlayers} />

            {/* Loading trigger & indicator */}
            {hasMore && (
                <div ref={loaderRef} className="py-8">
                    <div className="flex justify-center items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}

            {/* End of results */}
            {!hasMore && players.length > 24 && (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-neutral-400">
                    You've reached the end
                </div>
            )}
        </div>
    );
}
