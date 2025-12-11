"use client";

import { useState } from "react";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: logic.auth.signIn(email)
        console.log("Login with", email);
        setSent(true);
    };

    if (sent) {
    return (
        <div className="w-full py-12 px-4">
            <div className="text-center max-w-md w-full mx-auto">
                    <div className="mb-6 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-neutral-100">Check your email</h1>
                    <p className="text-lg text-slate-600 dark:text-neutral-400 mb-2">We sent a magic link to</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-neutral-100 break-words">{email}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-12 px-4">
            <div className="max-w-md w-full mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-neutral-100">Sign in / Sign up</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-neutral-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full min-w-[280px] p-3 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full min-w-[280px] py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                        Send Magic Link
                    </button>
                </form>
                <p className="mt-6 text-sm text-center text-slate-500 dark:text-neutral-400">
                    We'll send you a magic link to sign in without a password.
                </p>
            </div>
        </div>
    );
}
