import Link from "next/link";
import { MessageSquare, Heart, Share2, MoreHorizontal } from "lucide-react";
import { formatDate } from "@midfield/utils";

export function PostList({ posts }: { posts: any[] }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/30">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                <p className="text-muted-foreground text-sm mt-1">Be the first to start the discussion!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <article key={post.id} className="bg-card border border-border rounded-xl p-4 transition-all hover:bg-muted/10">
                    <div className="flex gap-3">
                        <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-accent to-primary flex items-center justify-center text-white font-medium text-sm shadow-xs">
                                {post.user_id ? post.user_id.substring(0, 2).toUpperCase() : "AN"}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-semibold text-foreground hover:underline cursor-pointer">
                                        User {post.user_id ? post.user_id.substring(0, 6) : "Anonymous"}
                                    </span>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span>@{post.user_id ? post.user_id.substring(0, 8) : "anon"}</span>
                                        <span>·</span>
                                        <span>{formatDate(new Date(post.created_at))}</span>
                                    </div>
                                </div>
                                <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="mt-2 text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px]">
                                {post.content}
                            </p>

                            <div className="flex items-center gap-6 mt-4 border-t border-border/50 pt-3">
                                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group">
                                    <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <span>24</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-pink-500 transition-colors group">
                                    <div className="p-1.5 rounded-full group-hover:bg-pink-500/10 transition-colors">
                                        <Heart className="w-4 h-4" />
                                    </div>
                                    <span>86</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-green-500 transition-colors group">
                                    <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </div>
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
