"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TakeCard } from "./TakeCard";
import { getPostThread } from "@/app/actions/posts";

interface ThreadViewProps {
    postId: string;
    topicTitle?: string;
    topicImageUrl?: string;
    topicType?: string;
    currentUser?: {
        id?: string;
        avatar_url: string | null;
        username: string | null;
    };
    clubName?: string;
    clubBadgeUrl?: string;
    topicPosition?: string;
    onBackToAll: () => void;
}

export function ThreadView({
    postId,
    topicTitle,
    topicImageUrl,
    topicType,
    currentUser,
    clubName,
    clubBadgeUrl,
    topicPosition,
    onBackToAll
}: ThreadViewProps) {
    const [loading, setLoading] = useState(true);
    const [thread, setThread] = useState<{ post: any; parent: any; replies: any[] } | null>(null);

    useEffect(() => {
        getPostThread(postId).then((data) => {
            setThread(data);
            setLoading(false);
        });
    }, [postId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!thread || !thread.post) {
        return (
            <div className="p-6 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 text-center">
                <p className="text-sm text-slate-500 dark:text-neutral-400">Post not found</p>
                <button
                    onClick={onBackToAll}
                    className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                    Back to all takes
                </button>
            </div>
        );
    }

    const { post, parent, replies } = thread;

    return (
        <div className="flex flex-col gap-3">
            {/* Back button */}
            <button
                onClick={onBackToAll}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors w-fit"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to all takes
            </button>

            {/* Parent post (if this is a reply) */}
            {parent && (
                <div className="opacity-75">
                    <TakeCard
                        post={parent}
                        currentUser={currentUser}
                        topicTitle={topicTitle}
                        topicImageUrl={topicImageUrl}
                        topicType={topicType}
                        clubName={clubName}
                        clubBadgeUrl={clubBadgeUrl}
                        topicPosition={topicPosition}
                    />
                </div>
            )}

            {/* Highlighted post */}
            <div className="ring-2 ring-emerald-500 dark:ring-emerald-600 rounded-lg">
                <TakeCard
                    post={post}
                    currentUser={currentUser}
                    topicTitle={topicTitle}
                    topicImageUrl={topicImageUrl}
                    topicType={topicType}
                    clubName={clubName}
                    clubBadgeUrl={clubBadgeUrl}
                    topicPosition={topicPosition}
                />
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div className="flex flex-col gap-3 pl-6 border-l-2 border-slate-200 dark:border-neutral-700">
                    {replies.map((reply) => (
                        <TakeCard
                            key={reply.id}
                            post={reply}
                            currentUser={currentUser}
                            topicTitle={topicTitle}
                            topicImageUrl={topicImageUrl}
                            topicType={topicType}
                            clubName={clubName}
                            clubBadgeUrl={clubBadgeUrl}
                            topicPosition={topicPosition}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
