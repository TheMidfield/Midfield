
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPostsPaginated } from "@/app/actions";
import { ProfileTakesList } from "@/components/profile/ProfileTakesList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

    // Initial fetch using paginated action
    const { posts, hasMore, nextCursor } = await getUserPostsPaginated({ limit: 10 });

    return (
        <div className="min-h-screen">
            <div style={{ width: '100%', maxWidth: '672px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
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

                <ProfileTakesList
                    mode="my-takes"
                    initialPosts={posts}
                    initialHasMore={hasMore}
                    initialCursor={nextCursor}
                    currentUser={{
                        id: user.id,
                        avatar_url: profile?.avatar_url,
                        username: profile?.username
                    }}
                />
            </div>
        </div>
    );
}
