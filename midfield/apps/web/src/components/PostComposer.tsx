"use client";

import { useState } from "react";

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
                className="w-full p-4 border-2 border-slate-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors resize-none"
                placeholder="Share your take..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
            />
            <button
                type="submit"
                className="mt-3 px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-neutral-900 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer"
            >
                Post
            </button>
        </form>
    );
}
