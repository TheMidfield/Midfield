"use client";

import { useState, useTransition } from "react";
import { Button } from "./ui/Button";
import { createTake } from "@/app/actions";

interface TakeComposerProps {
    topicId: string;
    topicTitle?: string;
    onSuccess?: () => void;
}

export function TakeComposer({ topicId, topicTitle, onSuccess }: TakeComposerProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPending) return;

        startTransition(async () => {
            const result = await createTake(topicId, content);
            if (result.success) {
                setContent("");
                setIsFocused(false);
                onSuccess?.();
            }
        });
    };

    const placeholder = topicTitle
        ? `Share your take on ${topicTitle}...`
        : "Share your take...";

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div
                className={`
                    rounded-2xl border-2 transition-all duration-300
                    ${isFocused
                        ? 'border-emerald-500 dark:border-emerald-400 bg-white dark:bg-neutral-900 ring-4 ring-emerald-500/10'
                        : 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/50'
                    }
                `}
            >
                <textarea
                    className="w-full p-4 bg-transparent text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none resize-none text-lg"
                    placeholder={placeholder}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => !content && setIsFocused(false)}
                    rows={isFocused ? 4 : 2}
                    disabled={isPending}
                />

                {(isFocused || content) && (
                    <div className="flex justify-between items-center px-4 pb-4">
                        <div className="text-xs text-slate-400 dark:text-neutral-500">
                            {content.length}/500
                        </div>
                        <Button
                            type="submit"
                            disabled={!content.trim() || isPending || content.length > 500}
                            size="sm"
                        >
                            {isPending ? "Posting..." : "Post Take"}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    );
}
