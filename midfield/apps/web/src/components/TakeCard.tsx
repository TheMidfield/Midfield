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
    reply_to_post_id?: string | null;
    author?: {
        username?: string;
        avatar_url?: string;
    };
    reply_to?: {
        id: string;
        content?: string;
        author?: {
            username?: string;
        };
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
    // Default expanded if there are replies (Always show full replies)
    const [isExpanded, setIsExpanded] = useState((post.reply_count || 0) > 0);
    const [isReplying, setIsReplying] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string; username: string; content?: string } | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState<Reply[]>([]);
    const [localReplyCount, setLocalReplyCount] = useState(post.reply_count || 0);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [isPending, startTransition] = useTransition();
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const replyComposerRef = useRef<HTMLDivElement>(null);
    const replyRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Username only - no display names
    const authorHandle = post.author?.username || `user_${post.author_id?.substring(0, 6) || "anon"}`;

    // Load replies when expanded
    useEffect(() => {
        if (isExpanded && replies.length === 0 && localReplyCount > 0) {
            setIsLoadingReplies(true);
            getReplies(post.id).then((data) => {
                // Normalize data: Supabase might return reply_to as array provided the query structure,
                // but simpler to just cast/map it correctly.
                const mappedReplies: Reply[] = data.map((r: any) => ({
                    ...r,
                    reply_to: Array.isArray(r.reply_to) ? r.reply_to[0] : r.reply_to
                }));
                setReplies(mappedReplies);
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
        if (isReplying && !replyingTo) {
            setIsReplying(false);
        } else {
            setIsReplying(true);
            setReplyingTo(null); // Reply to main post
            setIsExpanded(true);
            // Scroll to reply composer using window.scrollTo
            setTimeout(() => {
                if (replyComposerRef.current) {
                    const rect = replyComposerRef.current.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetY = rect.top + scrollTop - 100; // 100px offset from top

                    window.scrollTo({
                        top: targetY,
                        behavior: 'smooth'
                    });

                    setTimeout(() => replyInputRef.current?.focus(), 600);
                }
            }, 200);
        }
    };

    const scrollAndHighlightReply = (replyId: string) => {
        const element = replyRefs.current.get(replyId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight only the nested reply content area (columns 2-3)
            const contentArea = element.querySelector('[data-reply-content]');
            if (contentArea) {
                // Add transition class first
                contentArea.classList.add('transition-all', 'duration-500');

                // Add highlight
                contentArea.classList.add(
                    'bg-emerald-50/60',
                    'dark:bg-emerald-900/20',
                    'rounded-md'
                );

                // Fade out smoothly
                setTimeout(() => {
                    contentArea.classList.remove(
                        'bg-emerald-50/60',
                        'dark:bg-emerald-900/20',
                        'rounded-md'
                    );
                    // Remove transition after fade completes
                    setTimeout(() => {
                        contentArea.classList.remove('transition-all', 'duration-500');
                    }, 500);
                }, 2000);
            }
        }
    };

    const handleReplyToComment = (commentId: string, username: string, content: string) => {
        setIsReplying(true);
        setReplyingTo({ id: commentId, username, content });
        setIsExpanded(true);
    };

    const handleSubmitReply = () => {
        if (!replyContent.trim() || isPending) return;

        startTransition(async () => {
            const result = await createReply(post.id, post.id, post.topic_id || '', replyContent, replyingTo?.id);
            if (result.success && result.post) {
                // Add reply optimistically
                const newReply: Reply = {
                    ...result.post,
                    author: {
                        username: currentUser?.username || 'you',
                        avatar_url: currentUser?.avatar_url || undefined,
                    },
                    reply_to_post_id: replyingTo?.id,
                    reply_to: replyingTo ? {
                        id: replyingTo.id,
                        content: replyingTo.content,
                        author: { username: replyingTo.username }
                    } : undefined
                };
                setReplies(prev => [...prev, newReply]);
                setLocalReplyCount(prev => prev + 1);
                setReplyContent("");
                setIsReplying(false);
                setReplyingTo(null);
            } else {
                console.error("Reply failed:", result.error);
                alert("Failed to post reply: " + (result.error || "Unknown error"));
            }
        });
    };

    const handleCancelReply = () => {
        setReplyContent("");
        setIsReplying(false);
        setReplyingTo(null);
    };

    const hasRepliesOrReplying = (isExpanded && replies.length > 0) || isReplying;

    return (
        <article className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-md p-5">
            <div className="grid grid-cols-[48px_1fr] gap-x-0">
                {/* --- Left Column: Avatar & Spine --- */}
                <div className="relative flex flex-col items-center">
                    {/* Main Avatar */}
                    {post.author?.avatar_url ? (
                        <img
                            src={post.author.avatar_url}
                            alt={authorHandle}
                            className="w-10 h-10 rounded-md object-cover hover:opacity-90 transition-opacity cursor-pointer z-10 bg-white dark:bg-neutral-900"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center z-10">
                            <User className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                        </div>
                    )}

                    {/* The continuous Spine - stops at last reply curve */}
                    {hasRepliesOrReplying && (
                        <div className="absolute top-10 bottom-0 w-[2px] bg-slate-100 dark:bg-neutral-800 -mb-5" />
                    )}
                </div>

                {/* --- Right Column: Main Content --- */}
                <div className="min-w-0 pl-2">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1 h-5">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-neutral-100 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                                @{authorHandle}
                            </span>
                            <span className="text-slate-300 dark:text-neutral-600">•</span>
                            <span className="text-slate-400 dark:text-neutral-500 text-xs">
                                {formatDate(new Date(post.created_at))}
                            </span>
                        </div>
                        <button className="text-slate-300 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-neutral-400 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Post Text */}
                    <p className="text-slate-800 dark:text-neutral-200 leading-relaxed text-[15px] whitespace-pre-wrap mb-3">
                        {post.content}
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between">
                        <ReactionBar
                            postId={post.id}
                            initialCounts={reactionCounts}
                            userReaction={userReaction}
                        />


                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReplyClick}
                                className="h-8 px-2 flex items-center justify-center gap-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                    Reply{localReplyCount > 0 && ` (${localReplyCount})`}
                                </span>
                            </button>

                            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                                <Bookmark className="w-4 h-4" />
                            </button>

                            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                                <Share className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Replies Section (Full Width, inside Grid) --- */}
            </div>

            {/* Replies List */}
            {hasRepliesOrReplying && (
                <div className="mt-0 flex flex-col gap-0">
                    {/* Render Replies */}
                    {replies.map((reply, index) => {
                        const isLast = !isReplying && index === replies.length - 1;

                        return (
                            <div
                                key={reply.id}
                                className="grid grid-cols-[48px_48px_1fr] gap-x-0 relative group transition-all rounded-lg mb-3"
                                ref={(el) => {
                                    if (el) replyRefs.current.set(reply.id, el);
                                    else replyRefs.current.delete(reply.id);
                                }}
                            >
                                {/* Col 1: Spine Line */}
                                <div className="relative">
                                    {/* Main vertical line */}
                                    <div
                                        className="absolute left-[23px] -top-6 w-[2px] bg-slate-100 dark:bg-neutral-800"
                                        style={isLast ? { height: '36px' } : { bottom: 0 }}
                                    />

                                    {/* Curve */}
                                    <div className="absolute left-[23px] top-[12px] w-[27px] h-[20px] border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-2xl" />
                                </div>

                                {/* Col 2-3: Reply Content Wrapper */}
                                <div
                                    data-reply-content
                                    className={`col-span-2 grid grid-cols-[48px_1fr] gap-x-0 ${index === 0 ? 'mt-2' : ''}`}
                                >
                                    {/* Col 2: Reply Avatar */}
                                    <div className="relative z-10 pt-2 flex justify-center">
                                        {reply.author?.avatar_url ? (
                                            <img src={reply.author.avatar_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Col 3: Reply Content */}
                                    <div className="pt-2 pl-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-900 dark:text-neutral-100 text-xs">
                                                @{reply.author?.username || 'anon'}
                                            </span>
                                            <span className="text-slate-300 dark:text-neutral-600 text-xs">•</span>
                                            <span className="text-slate-400 dark:text-neutral-500 text-xs">
                                                {formatDate(new Date(reply.created_at))}
                                            </span>

                                            {/* Reply button - appears on hover inline */}
                                            <button
                                                onClick={() => handleReplyToComment(reply.id, reply.author?.username || 'anon', reply.content)}
                                                className="ml-auto opacity-0 group-hover:opacity-100 h-6 px-1.5 flex items-center gap-1 rounded-md text-[11px] font-medium transition-all cursor-pointer text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                <span>Reply</span>
                                            </button>
                                        </div>

                                        {/* Quoted message preview - minimal inline */}
                                        {reply.reply_to?.author?.username && (
                                            <div className="mb-1 mt-1.5 w-full min-w-0">
                                                <button
                                                    onClick={() => reply.reply_to?.id && scrollAndHighlightReply(reply.reply_to.id)}
                                                    data-reply-preview
                                                    className="w-full pl-2.5 py-1 border-l-2 border-slate-300/80 dark:border-neutral-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 cursor-pointer group text-left"
                                                >
                                                    <p className="text-[11px] line-clamp-2 text-slate-400 dark:text-neutral-500">
                                                        <span className="font-medium text-slate-500 dark:text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                            @{reply.reply_to.author.username}
                                                        </span>
                                                        {reply.reply_to.content && (
                                                            <>
                                                                <span className="text-slate-300 dark:text-neutral-600"> · </span>
                                                                <span>{reply.reply_to.content}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </button>
                                            </div>
                                        )}

                                        <p className="text-slate-700 dark:text-neutral-300 text-sm leading-relaxed pb-2">
                                            {reply.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Reply Composer */}
                    {isReplying && (
                        <div ref={replyComposerRef} className="grid grid-cols-[48px_48px_1fr] gap-x-0 relative pt-2">
                            {/* Col 1: Spine */}
                            <div className="relative">
                                {/* Last item logic: This IS the last item now. */}
                                {/* Line stops at curve start (12px) */}
                                <div
                                    className="absolute left-[23px] -top-6 w-[2px] bg-slate-100 dark:bg-neutral-800"
                                    style={{ height: '36px' }}
                                />

                                {/* Curve */}
                                <div className="absolute left-[23px] top-[12px] w-[27px] h-[20px] border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-2xl" />
                            </div>

                            {/* Col 2: User Avatar */}
                            <div className="relative z-10 pt-4 flex justify-center">
                                {currentUser?.avatar_url ? (
                                    <img src={currentUser.avatar_url} alt="You" className="w-8 h-8 rounded-md object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-neutral-700 flex items-center justify-center">
                                        <User className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                    </div>
                                )}
                            </div>

                            {/* Col 3: Input */}
                            <div className="pt-4 pl-1 pr-1 w-full min-w-0">
                                <div className="relative w-full">
                                    {replyingTo && (
                                        <div className="mb-3 flex items-center gap-2 pl-2.5 py-1.5 border-l-2 border-slate-200 dark:border-neutral-800 w-full min-w-0">
                                            <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                                <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 flex-shrink-0">
                                                    Replying to @{replyingTo.username}
                                                </span>
                                                {replyingTo.content && (
                                                    <>
                                                        <span className="text-[11px] text-slate-300 dark:text-neutral-600 flex-shrink-0">·</span>
                                                        <span
                                                            onClick={() => scrollAndHighlightReply(replyingTo.id)}
                                                            className="text-[11px] text-slate-400 dark:text-neutral-500 truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                                        >
                                                            {replyingTo.content}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="flex-shrink-0 w-5 h-5 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        ref={replyInputRef}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder={replyingTo ? "Write your reply..." : `Reply to @${authorHandle}...`}
                                        className="w-full p-3 text-sm bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300 dark:hover:border-neutral-600 hover:shadow-sm resize-none transition-all"
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
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button onClick={handleCancelReply} variant="ghost" size="sm" disabled={isPending}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSubmitReply} size="sm" icon={Send} disabled={!replyContent.trim() || isPending}>
                                            {isPending ? "Posting..." : "Reply"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Expander text if hidden */}
            {localReplyCount > 0 && !isExpanded && !isReplying && (
                <div className="grid grid-cols-[48px_1fr] gap-x-0 mt-3">
                    <div className="relative">
                        {/* Short spine stub */}
                        <div className="absolute left-[23px] -top-6 h-6 w-[2px] bg-slate-100 dark:bg-neutral-800" />
                        <div className="absolute left-[23px] top-0 w-[16px] h-[16px] border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-2xl" />
                    </div>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer justify-start pl-3 pt-2"
                    >
                        <ChevronDown className="w-4 h-4" />
                        Show {localReplyCount} {localReplyCount === 1 ? 'reply' : 'replies'}
                    </button>
                </div>
            )}
        </article>
    );
}
