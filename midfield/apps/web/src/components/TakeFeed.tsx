"use client";

import { Sparkles } from "lucide-react";
import { TakeCard } from "./TakeCard";
import { ReactionType } from "@/app/actions";

interface Post {
    id: string;
    content: string;
    created_at: string;
    author_id: string;
    topic_id?: string;
    reply_count?: number;
    reaction_count?: number;
    author?: {
        username?: string;
        avatar_url?: string;
    };
    reactionCounts?: Record<ReactionType, number>;
    userReaction?: ReactionType | null;
}

interface TakeFeedProps {
    posts: Post[];
    emptyTitle?: string;
    emptyMessage?: string;
    currentUser?: {
        avatar_url: string | null;
        username: string | null;
    };
}

export function TakeFeed({ posts, emptyTitle, emptyMessage, currentUser }: TakeFeedProps) {
    if (!posts || posts.length === 0) {
        return (
            <div
                className="flex items-center gap-4 p-4 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50"
            >
                <div
                    className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/30"
                >
                    <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                        {emptyTitle || "Be the first to drop a take"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        {emptyMessage || "Start the conversation"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map((post) => (
                <TakeCard
                    key={post.id}
                    post={post}
                    reactionCounts={post.reactionCounts}
                    userReaction={post.userReaction}
                    currentUser={currentUser}
                />
            ))}
        </div>
    );
}
