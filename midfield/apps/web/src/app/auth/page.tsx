"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";

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
                <div className="text-center w-full mx-auto" style={{ maxWidth: '500px', minWidth: '320px' }}>
                    <div className="mb-6 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
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
            <div className="w-full mx-auto" style={{ maxWidth: '500px', minWidth: '320px' }}>
                <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-neutral-100">Sign in / Sign up</h1>
                <p className="text-sm text-slate-600 dark:text-neutral-400 mb-8">
                    Enter your email to receive a magic link
                </p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="min-w-[280px]"
                        />
                    </div>
                    <Button type="submit" className="w-full min-w-[280px]" size="lg">
                        Send Magic Link
                    </Button>
                </form>
                <p className="mt-6 text-xs text-center text-slate-500 dark:text-neutral-400">
                    We'll send you a magic link to sign in without a password.
                </p>
            </div>
        </div>
    );
}
