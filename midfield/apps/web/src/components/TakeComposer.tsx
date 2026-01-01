"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "./ui/Button";
import { createTake } from "@/app/actions";
import { ArrowRight, User } from "lucide-react";
import { AuthModal } from "./ui/AuthModal";
import { useAuthModal } from "./ui/useAuthModal";

interface TakeComposerProps {
    topicId: string;
    topicTitle?: string;
    onSuccess?: (newPost: any) => void;
    userAvatar?: string | null;
    username?: string | null;
    /** User ID to check authentication - if null/undefined, user is anonymous */
    userId?: string;
}

export function TakeComposer({ topicId, topicTitle, onSuccess, userAvatar, username, userId }: TakeComposerProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isFocused, setIsFocused] = useState(false);
    const [isMac, setIsMac] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auth modal management
    const { isAuthModalOpen, authModalContext, requireAuth, closeAuthModal } = useAuthModal();
    const isAuthenticated = !!userId;

    useEffect(() => {
        const platform = window.navigator?.userAgent || '';
        setIsMac(/Mac|iPhone|iPod|iPad/.test(platform));
    }, []);

    // Intercept focus/click when not authenticated
    const handleInteraction = (e?: React.MouseEvent) => {
        if (!requireAuth(isAuthenticated, "take")) {
            e?.preventDefault();
            return false;
        }
        return true;
    };

    const handleFocus = () => {
        if (!handleInteraction()) return;
        setIsFocused(true);
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!handleInteraction(e)) return;
        textareaRef.current?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPending) return;

        // Double-check auth before submitting
        if (!requireAuth(isAuthenticated, "take")) return;

        startTransition(async () => {
            const result = await createTake(topicId, content);
            if (result.success && result.post) {
                // Optimistic update - add author info to the post
                const newPost = {
                    ...result.post,
                    author: {
                        username: username || 'you',
                        avatar_url: userAvatar,
                    }
                };
                setContent("");
                setIsFocused(false);
                onSuccess?.(newPost);
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const charCount = content.length;
    const maxChars = 1000;
    const isOverLimit = charCount > maxChars;
    const isNearLimit = charCount > maxChars * 0.8;

    return (
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                context={authModalContext}
            />

            <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
                <div
                    className={`
                        relative flex gap-3 p-4 rounded-md border-2 transition-all duration-200 ${isAuthenticated ? 'cursor-text' : 'cursor-pointer'}
                        ${isFocused
                            ? 'bg-white dark:bg-neutral-900 border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/15'
                            : 'bg-white dark:bg-neutral-800 border-slate-300 dark:border-neutral-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                        }
                    `}
                    onClick={handleClick}
                >
                    {/* Invisible overlay to catch clicks when unauthenticated */}
                    {!isAuthenticated && (
                        <div
                            className="absolute inset-0 z-20 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClick(e);
                            }}
                        />
                    )}

                    {/* Avatar */}
                    <div style={{ flexShrink: 0 }}>
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt="You"
                                className="w-10 h-10 rounded-md object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-md bg-slate-200 dark:bg-neutral-700 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                            </div>
                        )}
                    </div>

                    {/* Input area */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none resize-none text-[15px] leading-relaxed scrollbar-elegant"
                            placeholder={topicTitle ? `What's your take on ${topicTitle}?` : "What's your take?"}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={() => !content && setIsFocused(false)}
                            onKeyDown={handleKeyDown}
                            rows={isFocused || content ? 3 : 1}
                            disabled={isPending || !isAuthenticated}
                            style={{ minHeight: isFocused || content ? '72px' : '24px', transition: 'min-height 0.2s ease' }}
                        />

                        {/* Footer - always show faded Post button, full footer when focused */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: isFocused || content ? '12px' : '0' }}>
                            {(isFocused || content) && isAuthenticated && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                        className={`text-xs font-medium ${isOverLimit
                                            ? 'text-red-500'
                                            : isNearLimit
                                                ? 'text-amber-500'
                                                : 'text-slate-400 dark:text-neutral-500'
                                            }`}
                                    >
                                        {charCount}/{maxChars}
                                    </span>
                                    <span className="text-xs text-slate-300 dark:text-neutral-600">•</span>
                                    <div className="hidden md:flex text-[10px] font-bold px-2 py-1 items-center gap-0.5 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400">
                                        <span>{isMac ? '⌘' : 'Ctrl'}</span>
                                        <span>⏎</span>
                                    </div>
                                </div>
                            )}
                            <div className={!isFocused && !content ? 'ml-auto' : ''}>
                                <Button
                                    type="submit"
                                    disabled={!content.trim() || isPending || isOverLimit || !isAuthenticated}
                                    size="sm"
                                    icon={ArrowRight}
                                    className={!isFocused && !content ? 'opacity-40' : ''}
                                >
                                    {isPending ? "Posting..." : "Post"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
