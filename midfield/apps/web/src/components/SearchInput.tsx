"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { searchTopics } from "@/app/actions";
import { Topic } from "@midfield/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SearchInput() {
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
                const data = await searchTopics(query);
                setResults(data);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = () => {
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div ref={wrapperRef} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setIsOpen(true)}
                placeholder="Find player or club..."
                className="h-10 w-64 rounded-full bg-white/10 border border-white/5 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
            />

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                    {results.map((topic) => (
                        <Link
                            key={topic.id}
                            href={`/topic/${topic.slug}`}
                            onClick={handleSelect}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                            <img
                                src={topic.type === 'club' ? topic.metadata?.badge_url : topic.metadata?.avatar_url}
                                alt={topic.title}
                                className="w-8 h-8 object-contain bg-white/5 rounded-md p-0.5"
                            />
                            <div>
                                <div className="text-sm font-semibold text-white">{topic.title}</div>
                                <div className="text-xs text-gray-400 capitalize">{topic.type}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
