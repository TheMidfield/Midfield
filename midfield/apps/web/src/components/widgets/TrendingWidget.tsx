"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { getTrendingTopicsData } from "@/app/actions/fetch-widget-data";
import { Button } from "../ui/Button";

// Adapting the type for component usage
type TrendingItem = {
    id: string;
    rank: number;
    slug: string;
    tag: string;
    posts: string;
    isRising: boolean;
};

export function TrendingWidget() {
    const [trending, setTrending] = useState<TrendingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTrendingTopicsData()
            .then((data) => {
                setTrending(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch trending:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-6 flex justify-center items-center min-h-[200px]">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300 dark:text-neutral-600" />
            </div>
        );
    }

    if (trending.length === 0) return null;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-neutral-100">
                    <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    Trending
                </h3>
            </div>
            <div className="space-y-1">
                {trending.map((item) => (
                    <Link
                        key={item.id}
                        href={`/topic/${item.slug}`}
                        className="block"
                    >
                        <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-800/50 group cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-neutral-800">
                            <span className={`text-base sm:text-lg font-black w-4 text-center transition-colors ${item.rank <= 3
                                    ? 'text-emerald-600 dark:text-emerald-500'
                                    : 'text-slate-300 dark:text-neutral-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
                                }`}>
                                {item.rank}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-neutral-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                                    {item.tag}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-neutral-500">
                                    <span>{item.posts}</span>
                                    {item.isRising && (
                                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded">
                                            <ArrowUpRight className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">Rising</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-800">
                <Button variant="ghost" className="w-full text-xs font-bold text-slate-500 dark:text-neutral-400">
                    Show more
                </Button>
            </div>
        </div>
    );
}
