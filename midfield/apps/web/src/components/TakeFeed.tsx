"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { TakeCard } from "./TakeCard";
import { ReactionType, getTakesPaginated } from "@/app/actions";

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
    initialPosts: Post[];
    topicId: string;
    topicTitle?: string;
    topicImageUrl?: string;
    topicType?: string;
    emptyTitle?: string;
    emptyMessage?: string;
    currentUser?: {
        id?: string;
        avatar_url: string | null;
        username: string | null;
    };
    onAddPostRef?: React.MutableRefObject<((post: Post) => void) | null>;
    clubName?: string;
    clubBadgeUrl?: string;
    topicPosition?: string;
}

export function TakeFeed({
    initialPosts,
    topicId,
    topicTitle,
    topicImageUrl,
    topicType,
    emptyTitle,
    emptyMessage,
    currentUser,
    onAddPostRef,
    clubName,
    clubBadgeUrl,
    topicPosition,
}: TakeFeedProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [hasMore, setHasMore] = useState(initialPosts.length >= 10);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoadedMore, setHasLoadedMore] = useState(false);
    const [cursor, setCursor] = useState<string | null>(
        initialPosts.length > 0 ? initialPosts[initialPosts.length - 1].created_at : null
    );
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Handle new post added (for optimistic updates from composer)
    const addPost = useCallback((newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
    }, []);

    // Expose addPost to parent via ref
    useEffect(() => {
        if (onAddPostRef) {
            onAddPostRef.current = addPost;
        }
        return () => {
            if (onAddPostRef) {
                onAddPostRef.current = null;
            }
        };
    }, [addPost, onAddPostRef]);

    // Load more posts
    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore || !cursor) return;

        setIsLoading(true);
        try {
            const result = await getTakesPaginated(topicId, { cursor, limit: 10 });
            setPosts(prev => [...prev, ...result.posts]);
            setHasMore(result.hasMore);
            setCursor(result.nextCursor);
            setHasLoadedMore(true);
        } catch (error) {
            console.error("Error loading more posts:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, cursor, topicId]);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { rootMargin: "200px" } // Start loading 200px before reaching bottom
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, isLoading, loadMore]);

    // Handle post deletion
    const handleDelete = useCallback((postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    }, []);

    if (posts.length === 0) {
        return (
            <div className="flex items-center gap-4 p-4 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50">
                <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/30">
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
        <div className="flex flex-col gap-3">
            {posts.map((post) => (
                <TakeCard
                    key={post.id}
                    post={post}
                    reactionCounts={post.reactionCounts}
                    userReaction={post.userReaction}
                    currentUser={currentUser}
                    onDelete={handleDelete}
                    topicTitle={topicTitle}
                    topicImageUrl={topicImageUrl}
                    topicType={topicType}
                    clubName={clubName}
                    clubBadgeUrl={clubBadgeUrl}
                    topicPosition={topicPosition}
                />
            ))}

            {/* Sentinel for intersection observer */}
            <div ref={sentinelRef} className="h-1" />

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    <span className="ml-2 text-sm text-slate-500 dark:text-neutral-400">Loading more...</span>
                </div>
            )}

            {/* End of feed indicator - only show if user has actually paginated */}
            {!hasMore && hasLoadedMore && (
                <div className="text-center py-4 text-sm text-slate-400 dark:text-neutral-500">
                    You've reached the end
                </div>
            )}
        </div>
    );
}

// Export addPost ref for parent components
export type TakeFeedHandle = {
    addPost: (post: Post) => void;
};
