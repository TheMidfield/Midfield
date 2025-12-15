"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, MoreHorizontal, ChevronDown, ChevronUp, User } from "lucide-react";
import { formatDate } from "@midfield/utils";
import { ReactionBar } from "./ReactionBar";
import { ReactionType } from "@/app/actions";

interface TakeCardProps {
    post: {
        id: string;
        content: string;
        created_at: string;
        author_id: string;
        reply_count?: number;
        reaction_count?: number;
        author?: {
            username?: string;
            display_name?: string;
            avatar_url?: string;
        };
    };
    reactionCounts?: Record<ReactionType, number>;
    userReaction?: ReactionType | null;
    onReplyClick?: () => void;
}

export function TakeCard({ post, reactionCounts, userReaction, onReplyClick }: TakeCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const authorName = post.author?.display_name || post.author?.username ||
        `User ${post.author_id?.substring(0, 6) || "Anonymous"}`;
    const authorHandle = post.author?.username || post.author_id?.substring(0, 8) || "anon";

    return (
        <article className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-neutral-700">
            {/* Header */}
            <div className="flex gap-3 mb-3">
                {/* Avatar */}
                <div className="shrink-0">
                    {post.author?.avatar_url ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                            <img
                                src={post.author.avatar_url}
                                alt={authorName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                        </div>
                    )}
                </div>

                {/* Author info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-neutral-100 text-[15px] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer truncate">
                            {authorName}
                        </span>
                        <span className="text-slate-300 dark:text-neutral-600">•</span>
                        <span className="text-slate-400 dark:text-neutral-500 text-xs font-medium">
                            {formatDate(new Date(post.created_at))}
                        </span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-neutral-500">
                        @{authorHandle}
                    </div>
                </div>

                {/* More button */}
                <button className="text-slate-300 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-neutral-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <p className="text-slate-800 dark:text-neutral-200 leading-relaxed text-[15px] whitespace-pre-wrap mb-4">
                {post.content}
            </p>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800">
                <ReactionBar
                    postId={post.id}
                    initialCounts={reactionCounts}
                    userReaction={userReaction}
                />

                <div className="flex items-center gap-2">
                    {/* Reply count / button */}
                    <button
                        onClick={onReplyClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
                    >
                        <MessageSquare className="w-4 h-4" />
                        {(post.reply_count || 0) > 0 && (
                            <span>{post.reply_count}</span>
                        )}
                    </button>

                    {/* Expand/collapse replies toggle */}
                    {(post.reply_count || 0) > 0 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-3 h-3" />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3 h-3" />
                                    Show replies
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded replies area */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
                    <div className="text-sm text-slate-400 dark:text-neutral-500 italic">
                        Replies will load here...
                    </div>
                </div>
            )}
        </article>
    );
}
