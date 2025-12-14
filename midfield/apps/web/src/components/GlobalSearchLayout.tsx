"use client";

import { useSearch } from "@/context/SearchContext";
import { SearchResults } from "@/components/SearchResults";
import { ReactNode } from "react";

export function GlobalSearchLayout({ children }: { children: ReactNode }) {
    const { isSearching } = useSearch();

    return (
        <>
            {/* 
                We keep the children mounted but hidden if searching to preserve state 
                if the user cancels search. Or we can unmount them. 
                For "view replacement" feel, hiding is better for performance if the DOM isn't huge,
                but unmounting is cleaner. 
                Let's use conditional rendering for now as it's cleaner and "replacing".
            */}
            {isSearching ? (
                <SearchResults />
            ) : (
                children
            )}
        </>
    );
}
