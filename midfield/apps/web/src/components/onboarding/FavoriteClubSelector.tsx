"use client";

import { useState, useEffect } from "react";
import { Check, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

import { ALLOWED_LEAGUES } from "@midfield/logic/src/constants";

export interface Club {
    id: string;
    title: string;
    slug: string;
    metadata?: {
        badge_url?: string;
        league?: string;
    };
}

interface FavoriteClubSelectorProps {
    initialClubId?: string | null;
    onSelect: (club: Club | null) => void;
    className?: string;
}

export function FavoriteClubSelector({ initialClubId, onSelect, className }: FavoriteClubSelectorProps) {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClubId, setSelectedClubId] = useState<string | null>(initialClubId || null);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(30);

    useEffect(() => {
        const fetchClubs = async () => {
            const supabase = createClient();

            // Generate dynamic filter string from centralized constant
            const leagueFilter = ALLOWED_LEAGUES.map(league => `metadata->>league.eq."${league}"`).join(',');

            const { data } = await supabase
                .from('topics')
                .select('id, title, slug, metadata')
                .eq('type', 'club')
                .eq('is_active', true)
                // Filter for allowed leagues from constant
                .or(leagueFilter)
                .order('title', { ascending: true })
                .limit(200); // Buffer for safety

            if (data) {
                setClubs(data as Club[]);
            }
            setIsLoading(false);
        };

        fetchClubs();
    }, []);

    // Update internal state if prop changes
    useEffect(() => {
        if (initialClubId !== undefined) {
            setSelectedClubId(initialClubId);
        }
    }, [initialClubId]);

    // Reset visible count on search
    useEffect(() => {
        setVisibleCount(30);
    }, [searchQuery]);

    const filteredClubs = clubs.filter(club =>
        club.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.metadata?.league?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (club: Club) => {
        const newId = club.id === selectedClubId ? null : club.id;
        setSelectedClubId(newId);
        onSelect(newId ? club : null);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Load more when user is near bottom (e.g. 100px away)
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            if (visibleCount < filteredClubs.length) {
                setVisibleCount((prev) => Math.min(prev + 30, filteredClubs.length));
            }
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-slate-100 dark:bg-neutral-800 rounded-md w-full" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-32 bg-slate-100 dark:bg-neutral-800 rounded-md" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className || ''}`} style={{ width: '100%' }}>
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500 pointer-events-none z-10" />
                <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for your club..."
                    className="pl-9 pr-9 text-base box-border"
                    style={{ width: '100%' }} // Safe layout pattern
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer z-10"
                        type="button"
                        aria-label="Clear search"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            {/* Clubs Grid */}
            <div
                className="max-h-[280px] overflow-y-auto -mx-2 px-2 custom-scrollbar [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]"
                onScroll={handleScroll}
            >
                {filteredClubs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-6">
                        {filteredClubs.slice(0, visibleCount).map((club) => {
                            const isSelected = selectedClubId === club.id;

                            return (
                                <button
                                    key={club.id}
                                    onClick={() => handleSelect(club)}
                                    className={`
                                        group relative p-3 rounded-md border-2 transition-all duration-200 cursor-pointer flex flex-col items-center gap-3 text-center w-full
                                        ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                                            : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-neutral-800'
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                    )}

                                    <div className="relative w-12 h-12 shrink-0 transition-transform duration-200 group-hover:scale-110">
                                        {club.metadata?.badge_url ? (
                                            <img
                                                src={club.metadata.badge_url}
                                                alt={club.title}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <Shield className="w-full h-full text-slate-300 dark:text-neutral-600" />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-0.5 w-full">
                                        <span className={`text-xs font-bold leading-tight line-clamp-2 ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-neutral-200'}`}>
                                            {club.title}
                                        </span>
                                        {club.metadata?.league && (
                                            <span className="text-[10px] text-slate-500 dark:text-neutral-500 line-clamp-1">
                                                {club.metadata.league.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-slate-500 dark:text-neutral-400">No clubs found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
