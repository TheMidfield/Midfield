"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "./actions";

function AuthForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const urlError = searchParams.get('error');
        if (urlError) {
            setError(urlError);
        }
    }, [searchParams]);

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await signInWithEmail(email);
            if (result.success) {
                setSent(true);
            } else {
                setError(result.error || "Failed to send magic link");
            }
        });
    };

    const handleGoogleLogin = () => {
        setError(null);
        startTransition(async () => {
            const result = await signInWithGoogle();
            if (result.error) {
                setError(result.error);
            }
        });
    };

    if (sent) {
        return (
            <div style={{ width: '100%', maxWidth: '448px', margin: '0 auto', paddingTop: '64px', paddingBottom: '64px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="mb-6 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-neutral-100">Check your email</h1>
                    <p className="text-lg text-slate-600 dark:text-neutral-400 mb-2">We sent a magic link to</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-neutral-100">{email}</p>
                    <p className="mt-6 text-sm text-slate-500 dark:text-neutral-400">
                        Click the link in the email to sign in. You can close this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '448px', margin: '0 auto', paddingTop: '64px', paddingBottom: '64px' }}>
            <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-neutral-100">Sign in to Midfield</h1>
            <p className="text-sm text-slate-600 dark:text-neutral-400 mb-8">
                Join the conversation on football's biggest topics
            </p>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <button
                onClick={handleGoogleLogin}
                disabled={isPending}
                style={{ width: '100%' }}
                className="mb-6 inline-flex items-center justify-center gap-3 h-11 px-8 rounded-md border-2 border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 font-medium hover:border-slate-400 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{isPending ? "Redirecting..." : "Continue with Google"}</span>
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400">
                        Or continue with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isPending}
                        style={{ width: '100%' }}
                    />
                </div>
                <Button type="submit" size="lg" disabled={isPending} style={{ width: '100%' }}>
                    {isPending ? "Sending..." : "Send Magic Link"}
                </Button>
            </form>

            <p className="mt-6 text-xs text-center text-slate-500 dark:text-neutral-400">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    );
}

function AuthFormSkeleton() {
    return (
        <div style={{ width: '100%', maxWidth: '448px', margin: '0 auto', paddingTop: '64px', paddingBottom: '64px' }}>
            <div className="h-9 w-48 bg-slate-200 dark:bg-neutral-800 rounded mb-2 animate-pulse"></div>
            <div className="h-5 w-64 bg-slate-100 dark:bg-neutral-800 rounded mb-8 animate-pulse"></div>
            <div className="h-11 bg-slate-100 dark:bg-neutral-800 rounded-md mb-6 animate-pulse" style={{ width: '100%' }}></div>
            <div className="h-10 bg-slate-100 dark:bg-neutral-800 rounded-md mb-4 animate-pulse" style={{ width: '100%' }}></div>
            <div className="h-11 bg-emerald-200 dark:bg-emerald-900/50 rounded-md animate-pulse" style={{ width: '100%' }}></div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<AuthFormSkeleton />}>
            <AuthForm />
        </Suspense>
    );
}
