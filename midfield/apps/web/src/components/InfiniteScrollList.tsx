"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface InfiniteScrollListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    initialLoad?: number;
    batchSize?: number;
    containerClassName?: string;
    loadingComponent?: ReactNode;
}

export function InfiniteScrollList<T>({
    items,
    renderItem,
    initialLoad = 24,
    batchSize = 12,
    containerClassName = "",
    loadingComponent,
}: InfiniteScrollListProps<T>) {
    const [visibleCount, setVisibleCount] = useState(initialLoad);
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !isLoading) {
                    setIsLoading(true);
                    // Simulate network delay for smooth UX
                    setTimeout(() => {
                        setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
                        setIsLoading(false);
                    }, 300);
                }
            },
            { threshold: 0.1 }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore, isLoading, batchSize, items.length]);

    return (
        <>
            <div className={containerClassName}>
                {visibleItems.map((item, index) => renderItem(item, index))}
            </div>

            {/* Loading indicator */}
            {hasMore && (
                <div ref={loaderRef} className="py-8">
                    {loadingComponent || (
                        <div className="flex justify-center items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        </div>
                    )}
                </div>
            )}

            {/* End of results */}
            {!hasMore && items.length > initialLoad && (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-neutral-400">
                    You've reached the end
                </div>
            )}
        </>
    );
}
