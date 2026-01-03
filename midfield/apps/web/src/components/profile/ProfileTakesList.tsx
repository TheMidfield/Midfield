"use client";

import React, { useState, useEffect, useTransition } from "react";
import { TakeCard } from "@/components/TakeCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MessageCircle, Bookmark, Loader2, ArrowRight } from "lucide-react";
import { getUserPostsPaginated, getBookmarkedPostsPaginated } from "@/app/actions";

interface ProfileTakesListProps {
    mode: 'my-takes' | 'bookmarks';
    initialPosts: any[];
    initialHasMore: boolean;
    initialCursor: string | null;
    currentUser: {
        id: string;
        avatar_url: string | null;
        username: string | null;
    };
}

export function ProfileTakesList({
    mode,
    initialPosts,
    initialHasMore,
    initialCursor,
    currentUser
}: ProfileTakesListProps) {
    const [posts, setPosts] = useState(initialPosts);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [cursor, setCursor] = useState(initialCursor);
    const [isPending, startTransition] = useTransition();

    const loadMore = () => {
        if (isPending || !hasMore || !cursor) return;

        startTransition(async () => {
            const result = mode === 'my-takes'
                ? await getUserPostsPaginated({ cursor, limit: 10 })
                : await getBookmarkedPostsPaginated({ cursor, limit: 10 });

            if (result.posts.length > 0) {
                setPosts(prev => [...prev, ...result.posts]);
                setHasMore(result.hasMore);
                setCursor(result.nextCursor);
            } else {
                setHasMore(false);
            }
        });
    };

    if (posts.length === 0) {
        return (
            <Card className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                    {mode === 'my-takes' ? (
                        <MessageCircle className="w-6 h-6 text-slate-400 dark:text-neutral-500 shrink-0" />
                    ) : (
                        <Bookmark className="w-6 h-6 text-slate-400 dark:text-neutral-500 shrink-0" />
                    )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">
                    {mode === 'my-takes' ? "No takes yet" : "No bookmarks yet"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                    {mode === 'my-takes'
                        ? "Join the conversation by posting your first take!"
                        : "Any takes you bookmark will appear here."}
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3">
                {posts.map((post: any) => (
                    <TakeCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        isBookmarked={mode === 'bookmarks' ? true : post.isBookmarked}
                        userReaction={post.userReaction}
                        onDelete={mode === 'my-takes' ? (postId) => setPosts(prev => prev.filter(p => p.id !== postId)) : undefined}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4 pb-8">
                    <Button
                        variant="ghost"
                        onClick={loadMore}
                        disabled={isPending}
                        className="group h-10 px-8 rounded-full border border-slate-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all font-semibold text-slate-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <>
                                Load More
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
