"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function TopicDescription({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!description) return null;

    // If text is short, just show it without expand button
    if (description.length < 200) {
        return (
            <div className="pt-3 sm:pt-4">
                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                    {description}
                </p>
            </div>
        );
    }

    return (
        <div className="pt-3 sm:pt-4">
            <div className={`relative overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-[100px]'}`}>
                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                    {description}
                </p>
                {!isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none" />
                )}
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors cursor-pointer"
            >
                {isExpanded ? (
                    <>
                        <span>Show less</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                    </>
                ) : (
                    <>
                        <span>Read more</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                    </>
                )}
            </button>
        </div>
    );
}
