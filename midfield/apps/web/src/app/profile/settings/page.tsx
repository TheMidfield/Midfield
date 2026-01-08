import { getUser } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/settings/AccountSettings";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SettingsPage() {
    const user = await getUser();

    if (!user) {
        redirect('/');
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            {/* Back button */}
            <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Profile
            </Link>

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-neutral-100">Account Settings</h1>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2">
                    Manage your email address and password
                </p>
            </div>

            {/* Settings Component */}
            <AccountSettings currentEmail={user.email || ''} />
        </div>
    );
}
