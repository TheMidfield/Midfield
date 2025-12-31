import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookmarkedPosts } from "@/app/actions";
import { TakeCard } from "@/components/TakeCard";
import { Card } from "@/components/ui/Card";
import { Bookmark, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BookmarksPage() {
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

    const bookmarkedPosts = await getBookmarkedPosts();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
            <div style={{ width: '100%', maxWidth: '672px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <Link
                        href="/profile"
                        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 transition-colors"
                        style={{ flexShrink: 0 }}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ flexShrink: 0 }} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Bookmarks</h1>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Posts you've saved</p>
                    </div>
                </div>

                {/* Bookmarked Posts */}
                {bookmarkedPosts.length === 0 ? (
                    <Card style={{ padding: '48px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} className="rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Bookmark className="w-6 h-6 text-slate-400 dark:text-neutral-500" style={{ flexShrink: 0 }} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">No bookmarks yet</h3>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">
                            Click the bookmark icon on any post to save it here.
                        </p>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {bookmarkedPosts.map((post: any) => (
                            <TakeCard
                                key={post.id}
                                post={post}
                                currentUser={{
                                    id: user.id,
                                    avatar_url: profile?.avatar_url,
                                    username: profile?.username
                                }}
                                isBookmarked={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
