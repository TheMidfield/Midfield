"use client";

import { useState, useEffect } from "react";
import { Zap, MessageSquare, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { getRelatedTopicsData, type WidgetEntity, type WidgetTake } from "@/app/actions/fetch-widget-data";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

type Tab = 'topics' | 'takes';

export function RelatedTopicsWidget({ slug }: { slug?: string }) {
    const [activeTab, setActiveTab] = useState<Tab>('topics');
    const [data, setData] = useState<{ entities: WidgetEntity[], takes: WidgetTake[] }>({ entities: [], takes: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (slug) {
            getRelatedTopicsData(slug)
                .then((res) => {
                    setData(res);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch related:", err);
                    setLoading(false);
                });
        } else {
            // No slug = no context
            setLoading(false);
        }
    }, [slug]);

    if (!slug) return null; // Don't show if no context

    // Only show loader if we have a slug and are loading
    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-6 flex justify-center items-center min-h-[200px]">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300 dark:text-neutral-600" />
            </div>
        );
    }

    // If no data found at all
    if (data.entities.length === 0 && data.takes.length === 0) return null;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 shadow-sm">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-neutral-100">
                    Related
                </h3>
                <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('topics')}
                        className={cn(
                            "px-3 py-1 text-xs font-bold rounded-md transition-all",
                            activeTab === 'topics'
                                ? "bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                : "text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300"
                        )}
                    >
                        Topics
                    </button>
                    <button
                        onClick={() => setActiveTab('takes')}
                        className={cn(
                            "px-3 py-1 text-xs font-bold rounded-md transition-all",
                            activeTab === 'takes'
                                ? "bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                : "text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300"
                        )}
                    >
                        Takes
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[200px]">
                {activeTab === 'topics' ? (
                    <div className="space-y-3">
                        {data.entities.length > 0 ? data.entities.map((entity) => (
                            <Link key={entity.id} href={`/topic/${entity.slug}`} className="block">
                                <div className="group flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-neutral-800">
                                    {/* Avatar/Icon */}
                                    <div className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center border border-slate-200 dark:border-neutral-700 overflow-hidden shrink-0">
                                        {entity.imageUrl ? (
                                            <NextImage
                                                src={entity.imageUrl}
                                                alt={entity.title}
                                                fill
                                                className="object-contain p-1"
                                                sizes="40px"
                                            />
                                        ) : (
                                            <span className="font-bold text-slate-400 dark:text-neutral-500 text-xs">
                                                {entity.title.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-slate-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {entity.title}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-[9px] px-1 h-4 capitalize">
                                                {entity.type}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">
                                                {entity.relation}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action (Follow/View) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-8 text-neutral-500 text-sm">
                                No related topics found.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.takes.length > 0 ? data.takes.map((take) => (
                            <div key={take.id} className="p-3 bg-slate-50 dark:bg-neutral-800/30 rounded-lg border border-slate-100 dark:border-neutral-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden relative border border-emerald-500/10 dark:border-emerald-500/20">
                                        {take.author.avatar ? (
                                            <NextImage src={take.author.avatar} alt={take.author.name} fill className="object-cover" />
                                        ) : (
                                            <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400">
                                                {take.author.name.substring(0, 1)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                                        {take.author.handle}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        · {take.timeAgo}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-neutral-200 line-clamp-2 mb-2 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors">
                                    {take.title}
                                </p>
                                <div className="flex items-center gap-4 text-slate-400 dark:text-neutral-500">
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-3 h-3 group-hover:text-red-500 transition-colors" />
                                        <span className="text-[10px] font-semibold">{take.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-[10px] font-semibold">{take.comments}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-neutral-500 text-sm">
                                No recent takes found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
