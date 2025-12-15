"use client";

import { useState, useTransition } from "react";
import { toggleReaction, ReactionType } from "@/app/actions";

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

    const handleReaction = (type: ReactionType) => {
        // Optimistic update
        const previousReaction = userReaction;
        const previousCounts = { ...counts };

        if (userReaction === type) {
            // Removing reaction
            setUserReaction(null);
            setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
        } else {
            // Adding or changing reaction
            if (userReaction) {
                // Decrement old reaction
                setCounts(prev => ({ ...prev, [userReaction]: Math.max(0, prev[userReaction] - 1) }));
            }
            // Increment new reaction
            setUserReaction(type);
            setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
        }

        // Server update
        startTransition(async () => {
            const result = await toggleReaction(postId, type);
            // If server fails, we could revert, but for MVP we'll trust optimistic updates
        });
    };

    return (
        <div className="flex items-center gap-1">
            {REACTIONS.map(({ type, emoji, label }) => {
                const count = counts[type];
                const isActive = userReaction === type;

                return (
                    <button
                        key={type}
                        onClick={() => handleReaction(type)}
                        disabled={isPending}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                            transition-all duration-200 cursor-pointer
                            ${isActive
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
                            }
                            ${isPending ? 'opacity-50' : ''}
                        `}
                        title={label}
                    >
                        <span className="text-base">{emoji}</span>
                        {count > 0 && (
                            <span className="text-xs font-bold">{count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
