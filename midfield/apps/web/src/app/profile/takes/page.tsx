
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPosts } from "@/app/actions";
import { TakeCard } from "@/components/TakeCard";
import { Card } from "@/components/ui/Card";
import { MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { isPostBookmarked } from "@/app/actions";

export default async function MyTakesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth");
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("users")
        .select("avatar_url, username")
        .eq("id", user.id)
        .single();

    const userPosts = await getUserPosts();

    // Enhancing posts with bookmark status
    const postsWithBookmarks = await Promise.all(userPosts.map(async (post: any) => {
        const isBookmarked = await isPostBookmarked(post.id);
        return { ...post, isBookmarked };
    }));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
            <div className="w-full max-w-2xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/profile"
                        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 shrink-0" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">My Takes</h1>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Posts you've created</p>
                    </div>
                </div>

                {/* User Posts */}
                {postsWithBookmarks.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-slate-400 dark:text-neutral-500 shrink-0" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">No takes yet</h3>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">
                            Join the conversation by posting your first take!
                        </p>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-3">
                        {postsWithBookmarks.map((post: any) => (
                            <TakeCard
                                key={post.id}
                                post={post}
                                currentUser={{
                                    id: user.id,
                                    avatar_url: profile?.avatar_url,
                                    username: profile?.username
                                }}
                                isBookmarked={post.isBookmarked}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
