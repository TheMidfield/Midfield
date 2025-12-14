"use client";

import { useSearch } from "@/context/SearchContext";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

export function NavbarSearch() {
    const { query, setQuery, isSearching } = useSearch();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={cn(
                "relative transition-all duration-300 ease-out",
                isFocused || isSearching ? "w-[400px]" : "w-64"
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-full items-center rounded-full border-2 transition-colors",
                    "bg-slate-100 dark:bg-neutral-800",
                    isFocused
                        ? "border-emerald-500 dark:border-emerald-400 bg-white dark:bg-neutral-900 shadow-lg ring-4 ring-emerald-500/10"
                        : "border-slate-300 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-600"
                )}
            >
                <Search className="ml-3 mr-2 h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search clubs, players..."
                    className="flex-1 min-w-0 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
                {query && (
                    <div className="mr-3 ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400">
                        ESC
                    </div>
                )}
            </div>
        </div>
    );
}
