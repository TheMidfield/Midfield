"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function TopicDescription({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!description) return null;

    // If text is short, just show it.
    if (description.length < 250) {
        return <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed">{description}</p>;
    }

    return (
        <div className="relative">
            <div className={`relative overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-full' : 'max-h-[120px]'}`}>
                <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {description}
                </p>
                {!isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent" />
                )}
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors uppercase tracking-wide"
            >
                {isExpanded ? (
                    <>Show Less <ChevronUp className="w-3 h-3" /></>
                ) : (
                    <>Read More <ChevronDown className="w-3 h-3" /></>
                )}
            </button>
        </div>
    );
}
