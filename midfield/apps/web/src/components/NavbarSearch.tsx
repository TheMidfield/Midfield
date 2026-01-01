"use client";

import { useSearch } from "@/context/SearchContext";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

interface NavbarSearchProps {
    onSearchStart?: () => void;
}

export function NavbarSearch({ onSearchStart }: NavbarSearchProps = {}) {
    const { query, setQuery, isSearching, closeSearch } = useSearch();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Global shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && !isFocused && !isSearching) {
                // Prevent "/" from being typed
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFocused, isSearching]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            inputRef.current?.blur();
            closeSearch();
        } else if (e.key === "Enter") {
            // Submit search but collapse the bar
            inputRef.current?.blur();
        }
    };

    return (
        <div
            className={cn(
                "relative transition-all duration-300 ease-out w-full",
                isFocused || isSearching ? "md:w-[400px]" : "md:w-64"
            )}
        >
            <div
                className={cn(
                    "flex h-11 sm:h-10 w-full items-center rounded-full border-2 transition-colors",
                    "bg-slate-100 dark:bg-neutral-800",
                    isFocused
                        ? "border-emerald-500 dark:border-emerald-400 bg-white dark:bg-neutral-900 ring-4 ring-emerald-500/10"
                        : "border-slate-300 dark:border-neutral-700 hover:border-slate-500 dark:hover:border-neutral-500"
                )}
            >
                <Search className="ml-3 mr-2 h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setQuery(newValue);
                        // Trigger callback when search becomes active (2+ chars)
                        if (newValue.length >= 2 && query.length < 2 && onSearchStart) {
                            onSearchStart();
                        }
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search clubs, players..."
                    className="flex-1 min-w-0 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />

                {/* Clear button for mobile / ESC badge for desktop */}
                <div className="mr-1.5 flex items-center">
                    {query ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setQuery("");
                                inputRef.current?.focus();
                            }}
                            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-400 dark:text-neutral-500 transition-colors sm:hidden"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : null}

                    <div className="hidden sm:flex">
                        {(isFocused || query) ? (
                            <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400 min-w-[34px] text-center">
                                ESC
                            </div>
                        ) : (
                            <div className="text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400">
                                /
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
