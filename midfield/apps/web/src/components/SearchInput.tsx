"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { searchTopics } from "@/app/actions";
import { Topic } from "@midfield/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface SearchInputProps {
    className?: string;
    placeholder?: string;
    type?: string;
}

export function SearchInput({ className, placeholder = "Find player or club...", type }: SearchInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Topic[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                const data = await searchTopics(query, type);
                setResults(data);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, type]);

    const handleSelect = () => {
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div
            ref={wrapperRef}
            className={cn(
                "relative w-full",
                className
            )}
        >
            <div className="flex h-full w-full items-center rounded-full border-2 border-slate-300 bg-slate-100 px-3 text-sm transition-colors hover:border-slate-400 focus-within:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600 dark:focus-within:border-emerald-400">
                <Search className="mr-2 h-4 w-4 shrink-0 text-slate-500 dark:text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="flex-1 min-w-0 w-full bg-transparent py-2 text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-400"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl z-[100] dark:border-neutral-800 dark:bg-neutral-900">
                    {results.map((topic) => (
                        <Link
                            key={topic.id}
                            href={`/topic/${topic.slug}`}
                            onClick={handleSelect}
                            className="flex items-center gap-3 border-b border-slate-200 p-3 transition-colors hover:bg-slate-50 last:border-0 dark:border-white/5 dark:hover:bg-white/5"
                        >
                            <img
                                src={topic.type === 'club' ? (topic.metadata as any)?.badge_url : (topic.metadata as any)?.photo_url}
                                alt={topic.title}
                                className="h-8 w-8 rounded-md bg-slate-50 p-0.5 object-contain dark:bg-white/5"
                            />
                            <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">{topic.title}</div>
                                <div className="text-xs capitalize text-slate-500 dark:text-neutral-400">{topic.type}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
