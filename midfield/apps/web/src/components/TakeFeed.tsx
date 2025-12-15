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
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 24px',
                    borderRadius: '8px',
                    border: '1px dashed',
                }}
                className="border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-800/20"
            >
                <div
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                    }}
                    className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10"
                >
                    <Sparkles className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-1">
                    {emptyTitle || "No takes yet"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 text-center" style={{ maxWidth: '280px' }}>
                    {emptyMessage || "Be the first to share your perspective on this topic."}
                </p>
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
