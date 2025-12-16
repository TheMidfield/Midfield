"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toggleReaction, ReactionType } from "@/app/actions";
import { Smile, ChevronRight } from "lucide-react";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'hmm', emoji: '🤔', label: 'Hmm' },
    { type: 'fair', emoji: '🤝', label: 'Fair' },
    { type: 'dead', emoji: '💀', label: 'Dead' },
];

interface ReactionBarProps {
    postId: string;
    initialCounts?: Record<ReactionType, number>;
    userReaction?: ReactionType | null;
}

export function ReactionBar({ postId, initialCounts, userReaction: initialUserReaction }: ReactionBarProps) {
    const [counts, setCounts] = useState<Record<ReactionType, number>>(
        initialCounts || { fire: 0, hmm: 0, fair: 0, dead: 0 }
    );
    const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction || null);
    const [isPending, startTransition] = useTransition();
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };

        if (isPickerOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isPickerOpen]);

    const handleReaction = (type: ReactionType) => {
        if (isPending) return;

        // Optimistic update
        const previousReaction = userReaction;
        if (userReaction === type) {
            setUserReaction(null);
            setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
        } else {
            if (userReaction) {
                setCounts(prev => ({ ...prev, [userReaction]: Math.max(0, prev[userReaction] - 1) }));
            }
            setUserReaction(type);
            setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
        }

        // Keep picker open or close it? "don't make the button disappear" implies persistent UI, 
        // but typically reaction pickers close after selection. I'll close it for UX cleanliness.
        setIsPickerOpen(false);

        startTransition(async () => {
            await toggleReaction(postId, type);
        });
    };

    // Only show active reactions (count > 0)
    const activeReactions = REACTIONS.filter(r => counts[r.type] > 0 || userReaction === r.type);

    return (
        <div className="flex items-center gap-2" ref={pickerRef}>
            {/* Active Reactions Pills (Always Visible) */}
            {activeReactions.map(({ type, emoji, label }) => {
                const count = counts[type];
                const isActive = userReaction === type;

                return (
                    <button
                        key={type}
                        onClick={() => handleReaction(type)}
                        disabled={isPending}
                        className={`
                            h-7 px-2.5 flex items-center gap-1.5 rounded-full text-sm font-medium
                            transition-all cursor-pointer border
                            ${isActive
                                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : 'bg-transparent text-slate-600 dark:text-neutral-400 border-transparent hover:bg-slate-50 dark:hover:bg-neutral-800'
                            }
                        `}
                        title={label}
                    >
                        <span className="text-base leading-none">{emoji}</span>
                        <span className="text-xs font-semibold">{count}</span>
                    </button>
                );
            })}

            {/* Inline Reveal System */}
            <div className="relative flex items-center group">

                {/* React Toggle Button - pill-shaped like emoji buttons */}
                <button
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className={`
                        h-7 px-2.5 flex items-center gap-1.5 rounded-full text-sm font-medium transition-all cursor-pointer
                        ${isPickerOpen
                            ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60'
                            : 'bg-transparent text-slate-400 dark:text-neutral-500 hover:bg-slate-100/80 dark:hover:bg-neutral-800/60 hover:text-slate-700 dark:hover:text-neutral-300'
                        }
                    `}
                    title="Add reaction"
                >
                    <Smile className="w-4 h-4" />
                    <span className="text-xs font-semibold">React</span>
                </button>
                {/* Sliding Drawer (No Container/Border) */}
                {/* faster duration-200 */}
                {/* group-hover: width opens slightly to show arrow */}
                <div
                    className={`
                        flex items-center gap-1 h-8 overflow-hidden transition-all duration-200 ease-out origin-left
                        ${isPickerOpen
                            ? 'w-auto opacity-100 pl-2'
                            : 'w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-1'
                        }
                    `}
                >
                    {/* Elegant Separator Arrow */}
                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-neutral-600 flex-shrink-0" />

                    {/* Reaction Options (Only visible when fully open) */}
                    {/* We hide these on just hover/peek using opacity logic dependent on isPickerOpen */}
                    {REACTIONS.map(({ type, emoji, label }, index) => (
                        <button
                            key={type}
                            onClick={() => handleReaction(type)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-lg leading-none cursor-pointer flex-shrink-0
                                ${isPickerOpen ? 'visible' : 'invisible'}
                            `}
                            style={{
                                animation: isPickerOpen ? `fadeIn 200ms ease-out ${index * 40}ms forwards` : 'none',
                                opacity: 0
                            }}
                            title={label}
                        >
                            {emoji}
                        </button>
                    ))}

                    {/* Inline Keyframes for staggered fade in */}
                    <style jsx>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateX(-4px); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}
