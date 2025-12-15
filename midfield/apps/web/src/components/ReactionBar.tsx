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

        startTransition(async () => {
            await toggleReaction(postId, type);
        });
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {REACTIONS.map(({ type, emoji, label }) => {
                const count = counts[type];
                const isActive = userReaction === type;

                return (
                    <button
                        key={type}
                        onClick={() => handleReaction(type)}
                        disabled={isPending}
                        className={`
                            h-8 px-2 flex items-center gap-1 rounded-md text-sm font-medium
                            transition-colors cursor-pointer
                            ${isActive
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                            }
                            ${isPending ? 'opacity-50 pointer-events-none' : ''}
                        `}
                        title={label}
                    >
                        <span style={{ fontSize: '14px' }}>{emoji}</span>
                        {count > 0 && (
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
