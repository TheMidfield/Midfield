"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { searchTopics } from "@/app/actions";
import { Topic } from "@midfield/types";

type SearchFilter = 'all' | 'club' | 'player';

interface SearchContextType {
    query: string;
    setQuery: (q: string) => void;
    results: Topic[];
    isSearching: boolean;
    isLoading: boolean;
    filter: SearchFilter;
    setFilter: (f: SearchFilter) => void;
    closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<SearchFilter>('all');

    // Derived state
    const isSearching = query.length >= 2;

    const performSearch = useCallback(async (q: string, f: SearchFilter) => {
        setIsLoading(true);
        try {
            // Pass undefined if filter is 'all' to search everything
            const typeParam = f === 'all' ? undefined : f;
            const data = await searchTopics(q, typeParam);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!isSearching) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            performSearch(query, filter);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, filter, isSearching, performSearch]);

    const closeSearch = () => {
        setQuery("");
        setResults([]);
        setFilter('all');
    };

    return (
        <SearchContext.Provider
            value={{
                query,
                setQuery,
                results,
                isSearching,
                isLoading,
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
