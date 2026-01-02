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
        favorite_club?: {
            title: string;
            metadata?: {
                badge_url?: string;
                logo_url?: string;
            };
        };
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
            favorite_club?: {
                title: string;
                metadata?: {
                    badge_url?: string;
                    logo_url?: string;
                };
            };
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
    clubName?: string;
    clubBadgeUrl?: string;
    topicPosition?: string;
}

export const TakeCard = memo(function TakeCard({ post, reactionCounts, userReaction, currentUser, onDelete, isBookmarked: initialIsBookmarked, topicTitle, topicImageUrl, topicType, clubName, clubBadgeUrl, topicPosition }: TakeCardProps) {
    // Default expanded if there are replies (Always show full replies)
    const [isExpanded, setIsExpanded] = useState((post.reply_count || 0) > 0);
    const [isReplying, setIsReplying] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string; username: string; content?: string } | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState<Reply[]>([]);
    const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
    const [counts, setCounts] = useState((post as any).post_stats?.[0] || { upvotes: 0, downvotes: 0, reply_count: 0 });
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
            if (result.success && 'post' in result && result.post) {
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
            <article className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-md p-3 sm:p-5 min-w-0">
                <div className="grid grid-cols-[36px_1fr] xs:grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] gap-x-1.5 xs:gap-x-2 sm:gap-x-3">
                    {/* --- Left Column: Avatar & Spine --- */}
                    <div className="relative flex flex-col items-center">
                        {/* Main Avatar */}
                        {post.author?.avatar_url ? (
                            <img
                                src={post.author.avatar_url}
                                alt={authorHandle}
                                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-md object-cover hover:opacity-90 transition-all cursor-pointer z-10 bg-white dark:bg-neutral-900 active:scale-90 lg:active:scale-100"
                            />
                        ) : (
                            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center z-10">
                                <User className="w-4 xs:w-4.5 sm:w-5 h-4 xs:h-4.5 sm:h-5 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}

                        {/* The continuous Spine - stops at last reply curve */}
                        {hasRepliesOrReplying && (
                            <div className="absolute top-8 xs:top-9 sm:top-10 bottom-0 left-[17px] xs:left-[19px] sm:left-[23px] w-0.5 bg-slate-100 dark:bg-neutral-800 -mb-3 sm:-mb-5" />
                        )}
                    </div>

                    {/* --- Right Column: Main Content --- */}
                    <div className="min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1 sm:mb-2 h-5 sm:h-6 min-w-0 gap-1.5">
                            <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-slate-400 dark:text-neutral-500 leading-5 sm:leading-6 flex items-center">
                                {post.author?.favorite_club && (post.author.favorite_club.metadata?.badge_url || post.author.favorite_club.metadata?.logo_url) && (
                                    <img
                                        src={post.author.favorite_club.metadata.badge_url || post.author.favorite_club.metadata.logo_url}
                                        alt={post.author.favorite_club.title}
                                        className="w-5 h-5 object-contain mr-1.5 flex-shrink-0"
                                    />
                                )}
                                <span className="font-semibold text-slate-900 dark:text-neutral-100 text-xs xs:text-sm sm:text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-95 lg:active:scale-100 cursor-pointer mr-0.5">{authorHandle}</span><span className="text-slate-300 dark:text-neutral-600 text-[11px] xs:text-xs mx-1 xs:mx-1.5 sm:mx-2">•</span><span className="text-[11px] xs:text-xs">{formatDate(new Date(post.created_at))}</span>{wasEdited && <span className="hidden md:inline"><span className="text-slate-300 dark:text-neutral-600 text-xs mx-2">•</span><span className="text-[11px] italic">edited</span></span>}
                            </div>
                            {isOwner && !isEditing && (
                                <div className="flex items-center flex-shrink-0">
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
                                            <span className="text-xs font-semibold whitespace-nowrap">Delete</span>
                                        </button>
                                        <button
                                            onClick={() => { handleEdit(); setShowMenu(false); }}
                                            className="h-7 px-2.5 flex items-center gap-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border-transparent bg-transparent text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-700 dark:hover:text-neutral-200"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold whitespace-nowrap">Edit</span>
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
                            <div className="mt-1 mb-2 sm:mb-3 max-w-full">
                                <div className="p-2 sm:p-3 rounded-md border border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/10 bg-slate-50 dark:bg-neutral-800/50">
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
                                        className="w-full bg-transparent text-slate-800 dark:text-neutral-200 leading-relaxed text-sm sm:text-[15px] resize-none focus:outline-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-end items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isPending} className="text-xs sm:text-sm">
                                            Cancel
                                        </Button>
                                        <Button variant="default" size="sm" onClick={handleSaveEdit} disabled={isPending || !editContent.trim()} className="text-xs sm:text-sm">
                                            {isPending ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-800 dark:text-neutral-200 leading-relaxed text-sm xs:text-[15px] sm:text-[15px] whitespace-pre-wrap mb-2 sm:mb-3 break-words overflow-hidden max-w-full">
                                {localContent}
                            </p>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between">
                            <ReactionBar
                                postId={post.id}
                                initialCounts={reactionCounts}
                                userReaction={userReaction}
                                onPickerToggle={setIsReactionPickerOpen}
                            />


                            <div className={`flex items-center gap-1 sm:gap-2 transition-all duration-300 ${isReactionPickerOpen ? 'hidden xs:flex opacity-0 pointer-events-none w-0 sm:w-auto overflow-hidden sm:overflow-visible' : 'flex opacity-100'}`}>
                                <button
                                    onClick={handleReplyClick}
                                    className="h-8 sm:h-8 px-2 sm:px-2 flex items-center justify-center gap-1.5 sm:gap-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all active:scale-90 lg:active:scale-100 cursor-pointer"
                                >
                                    <CornerDownLeft className="w-4 sm:w-4 h-4 sm:h-4 transition-transform group-active:scale-110" />
                                    <span className="text-[11px] xs:text-xs sm:text-xs font-medium">
                                        Reply{localReplyCount > 0 && ` (${localReplyCount})`}
                                    </span>
                                </button>

                                <button
                                    onClick={handleBookmark}
                                    className={`w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-md transition-all active:scale-90 lg:active:scale-100 cursor-pointer ${bookmarked
                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                        : 'text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    <Bookmark className={`w-4 sm:w-4 h-4 sm:h-4 transition-transform ${bookmarked ? 'fill-current scale-110' : ''}`} />
                                </button>

                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all active:scale-90 lg:active:scale-100 cursor-pointer"
                                >
                                    <Share className="w-4 sm:w-4 h-4 sm:h-4" />
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
                                    className="grid grid-cols-[36px_32px_1fr] xs:grid-cols-[40px_36px_1fr] sm:grid-cols-[48px_40px_1fr] gap-x-0 relative group transition-all rounded-lg mb-1.5 sm:mb-3"
                                    ref={(el) => {
                                        if (el) replyRefs.current.set(reply.id, el);
                                        else replyRefs.current.delete(reply.id);
                                    }}
                                >
                                    {/* Col 1: Spine Line */}
                                    <div className="relative">
                                        {/* Main vertical line - extends from above to curve start, explicit height on last */}
                                        <div
                                            className={`absolute left-[17px] xs:left-[19px] sm:left-[23px] -top-5 xs:-top-6 sm:-top-7 w-0.5 bg-slate-100 dark:bg-neutral-800 ${isLast ? (index === 0 ? 'h-[34px] xs:h-[46px] sm:h-[50px]' : 'h-[26px] xs:h-[38px] sm:h-[42px]') : ''}`}
                                            style={isLast ? undefined : { bottom: 0 }}
                                        />
                                        {/* Curve */}
                                        <div className={`absolute left-[17px] xs:left-[19px] sm:left-[23px] top-2 sm:top-3 w-[17px] xs:w-[19px] sm:w-[23px] border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-lg ${index === 0 ? 'h-4 sm:h-5' : 'h-2.5 sm:h-3'}`} />
                                    </div>

                                    {/* Col 2-3: Reply Content Wrapper */}
                                    <div
                                        data-reply-content
                                        className={`col-span-2 grid grid-cols-[32px_1fr] xs:grid-cols-[36px_1fr] sm:grid-cols-[40px_1fr] gap-x-1.5 xs:gap-x-2 sm:gap-x-2.5 ${index === 0 ? 'mt-1.5 sm:mt-2' : ''}`}
                                    >
                                        {/* Col 2: Reply Avatar */}
                                        <div className="relative z-10 pt-1 sm:pt-2 flex justify-center">
                                            {reply.author?.avatar_url ? (
                                                <img src={reply.author.avatar_url} alt="" className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-md object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                                                    <User className="w-3 xs:w-3.5 sm:w-4 h-3 xs:h-3.5 sm:h-4 text-slate-400 dark:text-neutral-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Col 3: Reply Content */}
                                        <div className="pt-1 sm:pt-2 min-w-0">
                                            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 min-w-0 h-4 sm:h-5">
                                                {reply.author?.favorite_club && (reply.author.favorite_club.metadata?.badge_url || reply.author.favorite_club.metadata?.logo_url) && (
                                                    <img
                                                        src={reply.author.favorite_club.metadata.badge_url || reply.author.favorite_club.metadata.logo_url}
                                                        alt={reply.author.favorite_club.title}
                                                        className="w-4 h-4 object-contain mr-1 flex-shrink-0"
                                                    />
                                                )}
                                                <span className="font-semibold text-slate-900 dark:text-neutral-100 text-[11px] xs:text-xs sm:text-xs truncate">
                                                    {reply.author?.username || 'anon'}
                                                </span>
                                                <span className="text-slate-300 dark:text-neutral-600 text-[10px] xs:text-[11px] sm:text-xs flex-shrink-0">•</span>
                                                <span className="text-slate-400 dark:text-neutral-500 text-[10px] xs:text-[11px] sm:text-xs whitespace-nowrap flex-shrink-0">
                                                    {formatDate(new Date(reply.created_at))}
                                                </span>

                                                {/* Reply button - always visible on mobile, hover on desktop */}
                                                <button
                                                    onClick={() => handleReplyToComment(reply.id, reply.author?.username || 'anon', reply.content)}
                                                    className="ml-auto opacity-60 sm:opacity-0 sm:group-hover:opacity-100 h-6 sm:h-6 px-1.5 sm:px-1.5 flex items-center gap-1 sm:gap-1 rounded-md text-[11px] xs:text-xs sm:text-[11px] font-medium transition-all cursor-pointer text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 active:text-emerald-600 dark:active:text-emerald-400 hover:bg-slate-50 dark:hover:bg-neutral-800 active:bg-slate-50 dark:active:bg-neutral-800 shrink-0 active:scale-90 lg:active:scale-100"
                                                >
                                                    <CornerDownLeft className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Reply</span>
                                                </button>
                                            </div>

                                            {/* Quoted message preview - minimal inline */}
                                            {reply.reply_to?.author?.username && (
                                                <div className="mb-1 mt-1 sm:mt-1.5 w-full min-w-0">
                                                    <button
                                                        onClick={() => reply.reply_to?.id && scrollAndHighlightReply(reply.reply_to.id)}
                                                        data-reply-preview
                                                        className="w-full pl-2 sm:pl-2.5 py-0.5 sm:py-1 border-l-2 border-slate-300/80 dark:border-neutral-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 cursor-pointer group text-left active:scale-[0.98] lg:active:scale-100"
                                                    >
                                                        <p className="text-[11px] xs:text-xs sm:text-[11px] line-clamp-2 text-slate-400 dark:text-neutral-500">
                                                            <span className="font-medium text-slate-500 dark:text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                                {reply.reply_to.author.username}
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

                                            <p className="text-slate-700 dark:text-neutral-300 text-[13px] xs:text-sm sm:text-sm leading-relaxed pb-1.5 sm:pb-2">
                                                {reply.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Reply Composer */}
                        {isReplying && (
                            <div ref={replyComposerRef} className="grid grid-cols-[36px_32px_1fr] xs:grid-cols-[40px_36px_1fr] sm:grid-cols-[48px_40px_1fr] gap-x-0 relative pt-1 sm:pt-2">
                                {/* Col 1: Spine */}
                                <div className="relative">
                                    {/* Line extends from above to curve start - responsive height */}
                                    <div
                                        className="absolute left-[17px] xs:left-[19px] sm:left-[23px] -top-5 xs:-top-6 sm:-top-7 h-[34px] xs:h-[44px] sm:h-[48px] w-0.5 bg-slate-100 dark:bg-neutral-800"
                                    />
                                    {/* Curve */}
                                    <div className="absolute left-[17px] xs:left-[19px] sm:left-[23px] top-2 sm:top-3 w-[17px] xs:w-[19px] sm:w-[23px] h-3 sm:h-4 border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-lg" />
                                </div>

                                {/* Col 2: User Avatar */}
                                <div className="relative z-10 pt-2 sm:pt-4 flex justify-center">
                                    {currentUser?.avatar_url ? (
                                        <img src={currentUser.avatar_url} alt="You" className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-md object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-md bg-slate-200 dark:bg-neutral-700 flex items-center justify-center">
                                            <User className="w-3 xs:w-3.5 sm:w-4 h-3 xs:h-3.5 sm:h-4 text-slate-400 dark:text-neutral-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Col 3: Input */}
                                <div className="pt-2 sm:pt-4 pl-1.5 xs:pl-2 sm:pl-2.5 min-w-0">
                                    <div className="relative w-full">
                                        {replyingTo && (
                                            <div className="mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-2.5 py-1 sm:py-1.5 border-l-2 border-slate-200 dark:border-neutral-800 w-full min-w-0">
                                                <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5">
                                                    <span className="text-[11px] xs:text-xs sm:text-[11px] font-medium text-slate-500 dark:text-neutral-400 flex-shrink-0">
                                                        Replying to {replyingTo.username}
                                                    </span>
                                                    {replyingTo.content && (
                                                        <>
                                                            <span className="text-[11px] xs:text-xs sm:text-[11px] text-slate-300 dark:text-neutral-600 flex-shrink-0">·</span>
                                                            <span
                                                                onClick={() => scrollAndHighlightReply(replyingTo.id)}
                                                                className="text-[11px] xs:text-xs sm:text-[11px] text-slate-400 dark:text-neutral-500 truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer active:scale-[0.98] lg:active:scale-100"
                                                            >
                                                                {replyingTo.content}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors cursor-pointer active:scale-90 lg:active:scale-100"
                                                >
                                                    <svg className="w-2.5 sm:w-3 h-2.5 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        <textarea
                                            ref={replyInputRef}
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder={replyingTo ? "Write your reply..." : `Reply to ${authorHandle}...`}
                                            className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-md text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 hover:border-slate-300 dark:hover:border-neutral-600 resize-none transition-all"
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
                                        <div className="flex justify-end gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
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
                    <div className="grid grid-cols-[36px_1fr] xs:grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] gap-x-0 mt-2 sm:mt-3">
                        <div className="relative">
                            {/* Short spine stub - responsive height matching offset */}
                            <div className="absolute left-[17px] xs:left-[19px] sm:left-[23px] -top-3 xs:-top-4 sm:-top-5 h-3 xs:h-4 sm:h-5 w-0.5 bg-slate-100 dark:bg-neutral-800" />
                            <div className="absolute left-[17px] xs:left-[19px] sm:left-[23px] top-0 w-3 xs:w-3.5 sm:w-4 h-3 xs:h-3.5 sm:h-4 border-b-2 border-l-2 border-slate-100 dark:border-neutral-800 rounded-bl-xl" />
                        </div>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="flex items-center gap-1 sm:gap-1.5 text-[10px] xs:text-[11px] sm:text-xs font-medium text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer justify-start pl-2 sm:pl-3 pt-1 sm:pt-2"
                        >
                            <ChevronDown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
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
                    clubName={clubName}
                    clubBadgeUrl={clubBadgeUrl}
                    topicPosition={topicPosition}
                />
            </article>
        </>
    );
});
