import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center py-12 px-4">
            <div className="text-center max-w-md">
                <div className="mb-6 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-neutral-100">
                    Authentication Error
                </h1>
                <p className="text-slate-600 dark:text-neutral-400 mb-8">
                    Something went wrong during sign in. This can happen if you cancelled the sign-in process or the link expired.
                </p>
                <Link href="/">
                    <Button>Return to home</Button>
                </Link>
            </div>
        </div>
    );
}
