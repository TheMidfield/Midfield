"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { MoreHorizontal, ChevronDown, ChevronUp, User, Bookmark, Share, MessageCircle, Send } from "lucide-react";
import { formatDate } from "@midfield/utils";
import { ReactionBar } from "./ReactionBar";
import { ReactionType, createReply, getReplies } from "@/app/actions";
import { Button } from "./ui/Button";

interface Reply {
    id: string;
    content: string;
    created_at: string;
    author_id: string;
    author?: {
        username?: string;
        avatar_url?: string;
    };
}

interface TakeCardProps {
    post: {
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
    };
    reactionCounts?: Record<ReactionType, number>;
    userReaction?: ReactionType | null;
    currentUser?: {
        avatar_url: string | null;
        username: string | null;
    };
}

export function TakeCard({ post, reactionCounts, userReaction, currentUser }: TakeCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState<Reply[]>([]);
    const [localReplyCount, setLocalReplyCount] = useState(post.reply_count || 0);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [isPending, startTransition] = useTransition();
    const replyInputRef = useRef<HTMLTextAreaElement>(null);

    // Username only - no display names
    const authorHandle = post.author?.username || `user_${post.author_id?.substring(0, 6) || "anon"}`;

    // Load replies when expanded
    useEffect(() => {
        if (isExpanded && replies.length === 0 && localReplyCount > 0) {
            setIsLoadingReplies(true);
            getReplies(post.id).then((data) => {
                setReplies(data);
                setIsLoadingReplies(false);
            });
        }
    }, [isExpanded, post.id, replies.length, localReplyCount]);

    // Focus reply input when opening
    useEffect(() => {
        if (isReplying) {
            replyInputRef.current?.focus();
        }
    }, [isReplying]);

    const handleReplyClick = () => {
        setIsReplying(true);
        setIsExpanded(true);
    };

    const handleSubmitReply = () => {
        if (!replyContent.trim() || isPending) return;

        startTransition(async () => {
            const result = await createReply(post.id, post.id, post.topic_id || '', replyContent);
            if (result.success && result.post) {
                // Add reply optimistically
                const newReply: Reply = {
                    ...result.post,
                    author: {
                        username: currentUser?.username || 'you',
                        avatar_url: currentUser?.avatar_url || undefined,
                    }
                };
                setReplies(prev => [...prev, newReply]);
                setLocalReplyCount(prev => prev + 1);
                setReplyContent("");
                setIsReplying(false);
            }
        });
    };

    const handleCancelReply = () => {
        setReplyContent("");
        setIsReplying(false);
    };

    return (
        <article className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg">
            <div style={{ padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    {/* Avatar */}
                    <div style={{ flexShrink: 0 }}>
                        {post.author?.avatar_url ? (
                            <img
                                src={post.author.avatar_url}
                                alt={authorHandle}
                                className="w-10 h-10 rounded-md object-cover hover:opacity-90 transition-opacity cursor-pointer"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}
                    </div>

                    {/* Author info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="font-semibold text-slate-900 dark:text-neutral-100 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                                @{authorHandle}
                            </span>
                            <span className="text-slate-300 dark:text-neutral-600">•</span>
                            <span className="text-slate-400 dark:text-neutral-500 text-xs">
                                {formatDate(new Date(post.created_at))}
                            </span>
                        </div>
                    </div>

                    {/* More menu */}
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ marginBottom: '16px' }}>
                    <p className="text-slate-800 dark:text-neutral-200 leading-relaxed text-[15px] whitespace-pre-wrap">
                        {post.content}
                    </p>
                </div>

                {/* Action Bar - More subtle divider */}
                <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid' }}
                    className="border-slate-100/70 dark:border-neutral-800/70"
                >
                    {/* Left: Reactions */}
                    <ReactionBar
                        postId={post.id}
                        initialCounts={reactionCounts}
                        userReaction={userReaction}
                    />

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Reply Button - Text button */}
                        <Button
                            onClick={handleReplyClick}
                            variant="ghost"
                            size="sm"
                            icon={MessageCircle}
                            className="text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                            Reply{localReplyCount > 0 && ` (${localReplyCount})`}
                        </Button>

                        {/* Bookmark */}
                        <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                            <Bookmark className="w-4 h-4" />
                        </button>

                        {/* Share */}
                        <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                            <Share className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Show/Hide replies toggle */}
                {localReplyCount > 0 && !isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        style={{ marginTop: '12px' }}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                        <ChevronDown className="w-4 h-4" />
                        Show {localReplyCount} {localReplyCount === 1 ? 'reply' : 'replies'}
                    </button>
                )}
            </div>

            {/* Expanded Thread Area */}
            {(isExpanded || isReplying) && (
                <div style={{ borderTop: '1px solid' }} className="border-slate-100/70 dark:border-neutral-800/70">
                    {/* Replies List */}
                    {replies.length > 0 && (
                        <div style={{ padding: '16px 20px 0 20px' }}>
                            {replies.map((reply) => (
                                <div key={reply.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingLeft: '16px', borderLeft: '2px solid' }} className="border-slate-200 dark:border-neutral-700">
                                    {/* Reply Avatar */}
                                    <div style={{ flexShrink: 0 }}>
                                        {reply.author?.avatar_url ? (
                                            <img src={reply.author.avatar_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Reply Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <span className="font-semibold text-slate-900 dark:text-neutral-100 text-xs">
                                                @{reply.author?.username || 'anon'}
                                            </span>
                                            <span className="text-slate-300 dark:text-neutral-600 text-xs">•</span>
                                            <span className="text-slate-400 dark:text-neutral-500 text-xs">
                                                {formatDate(new Date(reply.created_at))}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-neutral-300 text-sm leading-relaxed">
                                            {reply.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoadingReplies && (
                        <div style={{ padding: '16px 20px' }} className="text-sm text-slate-400 dark:text-neutral-500">
                            Loading replies...
                        </div>
                    )}

                    {/* Reply Composer */}
                    {isReplying && (
                        <div style={{ padding: '16px 20px', display: 'flex', gap: '12px' }} className="bg-slate-50/50 dark:bg-neutral-800/30">
                            {/* User Avatar */}
                            <div style={{ flexShrink: 0 }}>
                                {currentUser?.avatar_url ? (
                                    <img src={currentUser.avatar_url} alt="You" className="w-8 h-8 rounded-md object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-neutral-700 flex items-center justify-center">
                                        <User className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                    </div>
                                )}
                            </div>
                            {/* Input */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <textarea
                                    ref={replyInputRef}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Reply to @${authorHandle}...`}
                                    className="w-full p-3 text-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-md text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                                    rows={2}
                                    disabled={isPending}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault();
                                            handleSubmitReply();
                                        }
                                        if (e.key === 'Escape') {
                                            handleCancelReply();
                                        }
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                    <Button onClick={handleCancelReply} variant="ghost" size="sm" disabled={isPending}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmitReply} size="sm" icon={Send} disabled={!replyContent.trim() || isPending}>
                                        {isPending ? "Posting..." : "Reply"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Collapse button when expanded */}
                    {isExpanded && !isReplying && (
                        <div style={{ padding: '12px 20px' }}>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            >
                                <ChevronUp className="w-4 h-4" />
                                Hide replies
                            </button>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
