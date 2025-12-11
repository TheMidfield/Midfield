"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

export function PostComposer({ topicSlug }: { topicSlug: string }) {
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call server action or API
        console.log("Submit post", content, topicSlug);
        setContent("");
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <textarea
                className="w-full p-4 border-2 border-slate-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors resize-none"
                placeholder="Share your take..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
            />
            <Button
                type="submit"
                className="mt-3"
            >
                Post
            </Button>
        </form>
    );
}
