"use client";

import { MessageSquare } from "lucide-react";
import { TakeCard } from "./TakeCard";

interface TakeFeedProps {
    posts: any[];
    onRefresh?: () => void;
}

export function TakeFeed({ posts, onRefresh }: TakeFeedProps) {
    if (!posts || posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-800/30">
                <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-neutral-700 mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-1">No takes yet</h3>
                <p className="text-slate-500 dark:text-neutral-400 font-medium text-center">
                    Be the first to share your take!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <TakeCard
                    key={post.id}
                    post={post}
                    onReplyClick={() => {
                        // TODO: Open reply composer
                        console.log('Reply to:', post.id);
                    }}
                />
            ))}
        </div>
    );
}
