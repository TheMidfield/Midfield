"use client";

import { useSearch } from "@/context/SearchContext";
import { TopicCard } from "@/components/TopicCard";
import { Button } from "@/components/ui/Button";
import { X, Filter, Search, Shield, User, Layers } from "lucide-react";

export function SearchResults() {
    const { query, results, filter, setFilter, closeSearch, isLoading, hasSearched } = useSearch();

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 gap-4 py-2 border-b border-slate-100 dark:border-neutral-800">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Search Results</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 truncate">
                        {query}
                    </h2>
                    <p className="text-slate-500 dark:text-neutral-400 text-xs font-medium mt-0.5">
                        Found {results.length} matches
                    </p>
                </div>
                <button
                    onClick={closeSearch}
                    className="flex flex-col items-center gap-1 group shrink-0 active:scale-90 transition-all"
                    aria-label="Close search"
                >
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-400 dark:text-neutral-500 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <X className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 hidden sm:inline">ESC</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter('all')}
                    icon={Layers}
                    className={`min-w-[100px] ${filter === 'all' ? '!bg-[#132019] !border-[#0D542B] !text-emerald-400 hover:!bg-[#1a2d24]' : ''}`}
                >
                    All Results
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter('club')}
                    icon={Shield}
                    className={`min-w-[100px] ${filter === 'club' ? '!bg-[#132019] !border-[#0D542B] !text-emerald-400 hover:!bg-[#1a2d24]' : ''}`}
                >
                    Clubs
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter('player')}
                    icon={User}
                    className={`min-w-[100px] ${filter === 'player' ? '!bg-[#132019] !border-[#0D542B] !text-emerald-400 hover:!bg-[#1a2d24]' : ''}`}
                >
                    Players
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 animate-pulse">
                            {/* Avatar skeleton */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-md bg-slate-200 dark:bg-neutral-700" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-4 bg-slate-200 dark:bg-neutral-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-100 dark:bg-neutral-800 rounded w-1/2" />
                                </div>
                            </div>
                            {/* Content skeleton */}
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-100 dark:bg-neutral-800 rounded w-full" />
                                <div className="h-3 bg-slate-100 dark:bg-neutral-800 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.map((topic) => (
                        <TopicCard key={topic.id} topic={topic} />
                    ))}
                </div>
            ) : hasSearched ? (
                <div className="flex items-center gap-4 p-4 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-neutral-700">
                        <Search className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                            No results for "{query}"
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                            Try a different search term or filter
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
