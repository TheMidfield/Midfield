"use client";

import { useState } from "react";

export function PostComposer({ topicId }: { topicId: string }) {
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call server action or API
        console.log("Submit post", content, topicId);
        setContent("");
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <textarea
                className="w-full p-2 border rounded"
                placeholder="Share your take..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold"
            >
                Post
            </button>
        </form>
    );
}
