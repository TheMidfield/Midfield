"use client";

import { useSearch } from "@/context/SearchContext";
import { TopicCard } from "@/components/TopicCard";
import { Button } from "@/components/ui/Button";
import { X, Filter } from "lucide-react";

export function SearchResults() {
    const { query, results, filter, setFilter, closeSearch, isLoading } = useSearch();

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
                        Results for "{query}"
                    </h2>
                    <p className="text-slate-500 dark:text-neutral-400 font-medium mt-1">
                        Found {results.length} matches
                    </p>
                </div>
                <Button variant="ghost" icon={X} onClick={closeSearch}>
                    Close Search
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                >
                    All Results
                </Button>
                <Button
                    variant={filter === 'club' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('club')}
                >
                    Clubs
                </Button>
                <Button
                    variant={filter === 'player' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('player')}
                >
                    Players
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="w-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mb-4"></div>
                    <p>Searching midfield...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.map((topic) => (
                        <TopicCard key={topic.id} topic={topic} />
                    ))}
                </div>
            ) : (
                <div className="w-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-xl">
                    <Filter className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-semibold text-lg">No results found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
