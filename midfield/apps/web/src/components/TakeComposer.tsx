"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "./ui/Button";
import { createTake } from "@/app/actions";
import { Send, User } from "lucide-react";

interface TakeComposerProps {
    topicId: string;
    topicTitle?: string;
    onSuccess?: (newPost: any) => void;
    userAvatar?: string | null;
    username?: string | null;
}

export function TakeComposer({ topicId, topicTitle, onSuccess, userAvatar, username }: TakeComposerProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPending) return;

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
    const maxChars = 500;
    const isOverLimit = charCount > maxChars;
    const isNearLimit = charCount > maxChars * 0.8;

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <div
                className={`
                    flex gap-3 p-4 rounded-lg border transition-all duration-200 cursor-text
                    ${isFocused
                        ? 'bg-white dark:bg-neutral-900 border-emerald-400 dark:border-emerald-500 ring-4 ring-emerald-500/10'
                        : 'bg-slate-50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                    }
                `}
                onClick={() => textareaRef.current?.focus()}
            >
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
                        className="w-full bg-transparent text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none resize-none text-[15px] leading-relaxed"
                        placeholder={topicTitle ? `What's your take on ${topicTitle}?` : "What's your take?"}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => !content && setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        rows={isFocused || content ? 3 : 1}
                        disabled={isPending}
                        style={{ minHeight: isFocused || content ? '72px' : '24px', transition: 'min-height 0.2s ease' }}
                    />

                    {/* Footer */}
                    {(isFocused || content) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
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
                                <span className="text-xs text-slate-400 dark:text-neutral-500">⌘↵ to post</span>
                            </div>
                            <Button
                                type="submit"
                                disabled={!content.trim() || isPending || isOverLimit}
                                size="sm"
                                icon={Send}
                            >
                                {isPending ? "Posting..." : "Post"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
