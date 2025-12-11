import Link from "next/link";
import { MessageSquare, Heart, Share2, MoreHorizontal } from "lucide-react";
import { formatDate } from "@midfield/utils";

export function PostList({ topicSlug, posts = [] }: { topicSlug: string; posts?: any[] }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-800/30">
                <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-neutral-700 mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-1">No discussions yet</h3>
                <p className="text-slate-500 dark:text-neutral-400 font-medium">Be the first to perform the kickoff!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <article key={post.id} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-[24px] p-6 transition-all duration-300 hover:border-slate-400 dark:hover:border-neutral-600 cursor-pointer group">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-neutral-900 font-bold text-sm shadow-md ring-4 ring-slate-50 dark:ring-neutral-800">
                                {post.user_id ? post.user_id.substring(0, 2).toUpperCase() : "AN"}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-slate-900 dark:text-neutral-100 text-[15px] hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                                            User {post.user_id ? post.user_id.substring(0, 6) : "Anonymous"}
                                        </span>
                                        <span className="text-slate-300 dark:text-neutral-600">•</span>
                                        <span className="text-slate-400 dark:text-neutral-500 text-xs font-semibold">{formatDate(new Date(post.created_at))}</span>
                                    </div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                                        @{post.user_id ? post.user_id.substring(0, 8) : "anon"}
                                    </div>
                                </div>
                                <button className="text-slate-300 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors -mr-2 -mt-2 cursor-pointer">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <p className="text-slate-800 dark:text-neutral-200 leading-relaxed text-[16px] whitespace-pre-wrap font-medium">
                                {post.content}
                            </p>

                            {/* Action Bar */}
                            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-slate-200 dark:border-neutral-800">
                                <ActionButton icon={MessageSquare} count={24} color="blue" />
                                <ActionButton icon={Heart} count={86} color="pink" />
                                <ActionButton icon={Share2} count="Share" color="green" />
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

function ActionButton({ icon: Icon, count, color }: { icon: any, count: string | number, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30",
        pink: "hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30",
        green: "hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30"
    };

    return (
        <button className={`flex items-center gap-2 text-sm font-semibold text-slate-400 dark:text-neutral-500 transition-colors cursor-pointer ${colorClasses[color]}`}>
            <div className="p-2 rounded-full transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <span>{count}</span>
        </button>
    );
}
