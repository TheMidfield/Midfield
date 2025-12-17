"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { searchTopics } from "@/app/actions";
import { Topic } from "@midfield/types";
import { usePathname } from "next/navigation";

type SearchFilter = 'all' | 'club' | 'player';

interface SearchContextType {
    query: string;
    setQuery: (q: string) => void;
    results: Topic[];
    isSearching: boolean;
    isLoading: boolean;
    hasSearched: boolean;
    filter: SearchFilter;
    setFilter: (f: SearchFilter) => void;
    closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<SearchFilter>('all');
    const pathname = usePathname();

    // Derived state
    const isSearching = query.length >= 2;

    const performSearch = useCallback(async (q: string, f: SearchFilter) => {
        setIsLoading(true);
        try {
            // Pass undefined if filter is 'all' to search everything
            const typeParam = f === 'all' ? undefined : f;
            const data = await searchTopics(q, typeParam);
            setResults(data);
            setHasSearched(true);
        } catch (error) {
            console.error("Search failed", error);
            setResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!isSearching) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        // Show loading immediately when query changes
        setIsLoading(true);

        const timer = setTimeout(() => {
            performSearch(query, filter);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, filter, isSearching, performSearch]);

    const closeSearch = () => {
        setQuery("");
        setResults([]);
        setFilter('all');
        setHasSearched(false);
    };

    // Close on route change
    useEffect(() => {
        closeSearch();
    }, [pathname]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isSearching) {
                closeSearch();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearching]);

    return (
        <SearchContext.Provider
            value={{
                query,
                setQuery,
                results,
                isSearching,
                isLoading,
                hasSearched,
                filter,
                setFilter,
                closeSearch
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}
