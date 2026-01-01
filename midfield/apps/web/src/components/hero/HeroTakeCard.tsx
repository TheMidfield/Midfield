"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { HeroTake } from "@/app/actions/hero-data";

const REACTION_EMOJIS = ['🔥', '🤔', '🤝', '💀'];

function getReactionForTake(id: string) {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return REACTION_EMOJIS[sum % REACTION_EMOJIS.length];
}

/**
 * HeroTakeCard - Individual take card for the live feed
 */
export const HeroTakeCard = memo(({ take }: { take: HeroTake }) => {
    const isPlayer = take.topic.type === 'player';
    const isClub = take.topic.type === 'club';

    const borderColor = isPlayer ? 'border-l-emerald-500' :
        isClub ? 'border-l-blue-500' : 'border-l-purple-500';

    const topicColor = isPlayer ? 'text-emerald-600 dark:text-emerald-400' :
        isClub ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400';

    return (
        <Link href={`/topic/${take.topic.slug}`} className="block group">
            <article
                className={`
                    bg-white dark:bg-neutral-900
                    border border-slate-200 dark:border-neutral-800
                    border-l-4 ${borderColor}
                    rounded-r-md rounded-l-[2px]
                    hover:border-slate-300 dark:hover:border-neutral-700
                    transition-all duration-200
                    cursor-pointer
                `}
                style={{ width: '100%' }}
            >
                <div style={{ padding: '12px' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2" style={{ minWidth: 0 }}>
                        <div className="flex items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                            <div
                                className="rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0"
                                style={{ width: '24px', height: '24px' }}
                            >
                                {take.author.avatarUrl ? (
                                    <Image
                                        src={take.author.avatarUrl}
                                        alt={take.author.username}
                                        width={24}
                                        height={24}
                                        className="object-cover w-full h-full"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <span className="text-slate-400" style={{ fontSize: '10px', fontWeight: 700 }}>
                                        {take.author.username.slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span
                                className="font-medium text-slate-900 dark:text-neutral-200 truncate"
                                style={{ fontSize: '12px', minWidth: 0 }}
                            >
                                @{take.author.username}
                            </span>
                        </div>

                        <span
                            className={`uppercase font-bold tracking-wider shrink-0 ${topicColor}`}
                            style={{ fontSize: '10px', marginLeft: '8px' }}
                        >
                            {take.topic.title}
                        </span>
                    </div>

                    {/* Content */}
                    <p
                        className="text-slate-800 dark:text-neutral-200 leading-relaxed line-clamp-3"
                        style={{ fontSize: '14px', marginBottom: '10px', minWidth: 0 }}
                    >
                        {take.content}
                    </p>

                    {/* Footer */}
                    <div
                        className="flex items-center justify-between border-t border-slate-100 dark:border-neutral-800/50"
                        style={{ paddingTop: '8px' }}
                    >
                        <div className="flex items-center" style={{ gap: '12px' }}>
                            {take.reactionCount > 0 && (
                                <div
                                    className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 bg-slate-50 dark:bg-neutral-800 rounded-md"
                                    style={{ fontSize: '10px', padding: '2px 6px' }}
                                >
                                    <span>{getReactionForTake(take.id)}</span>
                                    <span className="font-medium">{take.reactionCount}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400" style={{ fontSize: '10px' }}>
                                <MessageCircle className="shrink-0" style={{ width: '12px', height: '12px' }} />
                                <span>Reply</span>
                            </div>
                        </div>
                        <span className="text-slate-400 dark:text-neutral-500" style={{ fontSize: '10px' }}>Now</span>
                    </div>
                </div>
            </article>
        </Link>
    );
});

HeroTakeCard.displayName = 'HeroTakeCard';
