"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export function TopicDescription({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // If text is short, just show it.
    if (!description || description.length < 200) {
        return <p className="text-slate-600 dark:text-neutral-400 leading-relaxed text-lg">{description}</p>;
    }

    return (
        <div className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg p-6 transition-all">
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-neutral-100 font-bold text-sm uppercase tracking-wide">
                <Info className="w-4 h-4 text-green-600 dark:text-green-400" />
                About
            </div>

            <div className={`relative overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px]' : 'max-h-24'}`}>
                <p className="text-slate-600 dark:text-neutral-400 leading-relaxed text-sm lg:text-base">
                    {description}
                </p>
                {!isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 dark:from-neutral-800 to-transparent flex items-end justify-center" />
                )}
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center gap-1.5 text-sm font-bold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors cursor-pointer"
            >
                {isExpanded ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                ) : (
                    <>Read More <ChevronDown className="w-4 h-4" /></>
                )}
            </button>
        </div>
    );
}
