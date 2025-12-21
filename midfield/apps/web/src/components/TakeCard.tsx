"use client";

import React, { useState, useTransition, useRef, useEffect, useCallback, memo } from "react";
import { MoreHorizontal, ChevronDown, ChevronUp, User, Bookmark, Share, MessageCircle, Send, Pencil, Trash2, ChevronRight, ChevronLeft, CornerDownLeft, ArrowRight } from "lucide-react";
import { formatDate } from "@midfield/utils";
import { ReactionBar } from "./ReactionBar";
import { ReactionType, createReply, getReplies, updatePost, deletePost, toggleBookmark } from "@/app/actions";
import { Button } from "./ui/Button";
import { ConfirmModal } from "./ui/ConfirmModal";
import { ShareModal } from "./ui/ShareModal";
import { Toast } from "./ui/Toast";
import { AuthModal } from "./ui/AuthModal";
import { useAuthModal } from "./ui/useAuthModal";
import { cn } from "@/lib/utils";

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
        updated_at?: string;
    };
    reactionCounts?: Record<ReactionType, number>;
    userReaction?: ReactionType | null;
    currentUser?: {
        id?: string;
        avatar_url: string | null;
        username: string | null;
    };
    onDelete?: (postId: string) => void;
    isBookmarked?: boolean;
    topicTitle?: string;
    topicImageUrl?: string;
    topicType?: string;
}

export const TakeCard = memo(function TakeCard({ post, reactionCounts, userReaction, currentUser, onDelete, isBookmarked: initialIsBookmarked, topicTitle, topicImageUrl, topicType }: TakeCardProps) {
    // Default expanded if there are replies (Always show full replies)
    const [isExpanded, setIsExpanded] = useState((post.reply_count || 0) > 0);
    const [isReplying, setIsReplying] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string; username: string; content?: string } | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState<Reply[]>([]);
    const [localReplyCount, setLocalReplyCount] = useState(post.reply_count || 0);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [toastState, setToastState] = useState<{ message: string | null; type: 'success' | 'error' }>({ message: null, type: 'success' });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToastState({ message, type });
        setTimeout(() => setToastState({ message: null, type: 'success' }), 3000);
    };

    const [isPending, startTransition] = useTransition();
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const replyComposerRef = useRef<HTMLDivElement>(null);
    const replyRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Auth modal management
    const { isAuthModalOpen, authModalContext, requireAuth, closeAuthModal } = useAuthModal();
    const isAuthenticated = !!currentUser?.id;

    // Edit/Delete state
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [localContent, setLocalContent] = useState(post.content);
    const [isDeleted, setIsDeleted] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [bookmarked, setBookmarked] = useState(initialIsBookmarked ?? false);
    const [wasEdited, setWasEdited] = useState(post.updated_at && post.updated_at !== post.created_at);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    // Check if current user owns this post
    const isOwner = currentUser?.id && currentUser.id === post.author_id;

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
        // Check auth first
        if (!requireAuth(isAuthenticated, "reply")) return;

        if (isReplying && !replyingTo) {
            setIsReplying(false);
        } else {
            setIsReplying(true);
            setReplyingTo(null); // Reply to main post
            setIsExpanded(true);
            // Scroll to reply composer - scroll into view with some padding
            setTimeout(() => {
                if (replyComposerRef.current) {
                    replyComposerRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    setTimeout(() => replyInputRef.current?.focus(), 400);
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
        // Check auth first
        if (!requireAuth(isAuthenticated, "reply")) return;

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

    // Edit handlers
    const handleEdit = () => {
        setEditContent(localContent);
        setIsEditing(true);
        setTimeout(() => editInputRef.current?.focus(), 0);
    };

    const handleSaveEdit = () => {
        if (!editContent.trim() || isPending) return;

        startTransition(async () => {
            const result = await updatePost(post.id, editContent);
            if (result.success) {
                setLocalContent(editContent);
                setIsEditing(false);
                setWasEdited(true);
            } else {
                alert("Failed to save: " + (result.error || "Unknown error"));
            }
        });
    };

    const handleCancelEdit = () => {
        setEditContent(localContent);
        setIsEditing(false);
    };

    // Delete handler
    // Delete handler
    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        startTransition(async () => {
            const result = await deletePost(post.id);
            if (result.success) {
                setIsDeleted(true);
                onDelete?.(post.id);
            } else {
                showToast(result.error || "Failed to delete post", 'error');
            }
        });
    };

    // Bookmark handler
    const handleBookmark = () => {
        // Check auth first
        if (!requireAuth(isAuthenticated, "bookmark")) return;

        // Optimistic update
        setBookmarked(!bookmarked);
        startTransition(async () => {
            const result = await toggleBookmark(post.id);
            if (!result.success) {
                // Revert on failure
                setBookmarked(bookmarked);
            }
        });
    };

    const hasRepliesOrReplying = (isExpanded && replies.length > 0) || isReplying;

    // Don't render if deleted
    if (isDeleted) return null;

    return (
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                context={authModalContext}
            />
            <Toast message={toastState.message} type={toastState.type} />
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
                                {wasEdited && (
                                    <>
                                        <span className="text-slate-300 dark:text-neutral-600">•</span>
                                        <span className="text-slate-400 dark:text-neutral-500 text-[11px] italic">edited</span>
                                    </>
                                )}
                            </div>
                            {isOwner && !isEditing && (
                                <div className="flex items-center">
                                    <div
                                        className={`
                                        flex items-center gap-1 overflow-hidden transition-all duration-200 ease-out
                                        ${showMenu ? 'w-auto opacity-100 mr-1' : 'w-0 opacity-0'}
                                    `}
                                    >
                                        <button
                                            onClick={() => { handleDeleteClick(); setShowMenu(false); }}
                                            className="h-7 px-2.5 flex items-center gap-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border-transparent bg-transparent text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold">Delete</span>
                                        </button>
                                        <button
                                            onClick={() => { handleEdit(); setShowMenu(false); }}
                                            className="h-7 px-2.5 flex items-center gap-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border-transparent bg-transparent text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-700 dark:hover:text-neutral-200"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold">Edit</span>
                                        </button>
                                    </div>
                                    {/* Toggle button with hover chevron */}
                                    <div className="relative flex items-center group">
                                        <button
                                            onClick={() => setShowMenu(!showMenu)}
                                            className={`
                                            h-7 px-2 flex items-center gap-1 rounded-full text-sm font-medium transition-all cursor-pointer border
                                            ${showMenu
                                                    ? 'bg-slate-100 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 border-slate-300 dark:border-neutral-600 hover:bg-slate-200 dark:hover:bg-neutral-700 hover:border-slate-400 dark:hover:border-neutral-500'
                                                    : 'bg-transparent text-slate-400 dark:text-neutral-500 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                                }
                                        `}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        {/* Hover chevron peek - points left toward menu */}
                                        <div
                                            className={`
                                            flex items-center overflow-hidden transition-all duration-200 ease-out origin-right mr-0.5
                                            ${showMenu
                                                    ? 'w-4 opacity-100'
                                                    : 'w-0 group-hover:w-4 opacity-0 group-hover:opacity-100'
                                                }
                                        `}
                                            style={{ order: -1 }}
                                        >
                                            <ChevronLeft className="w-3 h-3 text-slate-300 dark:text-neutral-600 flex-shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Post Text */}
                        {isEditing ? (
                            <div className="mt-1 mb-3">
                                <div className="p-3 rounded-md border border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/10 bg-slate-50 dark:bg-neutral-800/50">
                                    <textarea
                                        ref={editInputRef}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                e.preventDefault();
                                                handleSaveEdit();
                                            }
                                            if (e.key === 'Escape') {
                                                handleCancelEdit();
                                            }
                                        }}
                                        className="w-full bg-transparent text-slate-800 dark:text-neutral-200 leading-relaxed text-[15px] resize-none focus:outline-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-end items-center gap-2 mt-3">
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isPending}>
                                            Cancel
                                        </Button>
                                        <Button variant="default" size="sm" onClick={handleSaveEdit} disabled={isPending || !editContent.trim()}>
                                            {isPending ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-800 dark:text-neutral-200 leading-relaxed text-[15px] whitespace-pre-wrap mb-3">
                                {localContent}
                            </p>
                        )}

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
                                    <CornerDownLeft className="w-4 h-4" />
                                    <span className="text-xs font-medium">
                                        Reply{localReplyCount > 0 && ` (${localReplyCount})`}
                                    </span>
                                </button>

                                <button
                                    onClick={handleBookmark}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${bookmarked
                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                        : 'text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                                </button>

                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                >
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
                                        {/* Main vertical line - extends from above to curve start */}
                                        <div
                                            className="absolute left-[23px] -top-6 w-[2px] bg-slate-100 dark:bg-neutral-800"
                                            style={isLast ? { height: index === 0 ? 'calc(24px + 20px)' : 'calc(24px + 12px)' } : { bottom: 0 }}
                                        />

                                        {/* Curve - first reply: 12+20=32px (accounts for mt-2), others: 12+12=24px */}
                                        <div className={`absolute left-[23px] top-[12px] w-[27px] border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-lg ${index === 0 ? 'h-[20px]' : 'h-[12px]'}`} />
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
                                    {/* Line extends from above to curve start */}
                                    <div
                                        className="absolute left-[23px] -top-6 w-[2px] bg-slate-100 dark:bg-neutral-800"
                                        style={{ height: 'calc(24px + 12px)' }}
                                    />

                                    {/* Curve - composer avatar has pt-4, so center at ~32px from curve start */}
                                    <div className="absolute left-[23px] top-[12px] w-[27px] h-[20px] border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-lg" />
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
                                            className="w-full p-3 text-sm bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-md text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 hover:border-slate-300 dark:hover:border-neutral-600 resize-none transition-all"
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
                                            <Button onClick={handleSubmitReply} size="sm" icon={ArrowRight} disabled={!replyContent.trim() || isPending}>
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
                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Post"
                    message="This action cannot be undone."
                    confirmText="Delete"
                    variant="danger"
                />

                {/* Share Modal */}
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    content={localContent}
                    authorUsername={authorHandle}
                    authorAvatar={post.author?.avatar_url}
                    createdAt={post.created_at}
                    topicTitle={topicTitle}
                    topicImageUrl={topicImageUrl}
                    topicType={topicType}
                />
            </article>
        </>
    );
});
