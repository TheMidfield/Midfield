"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/auth/actions";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!password.trim() || !confirmPassword.trim()) {
            setError("Please fill in all fields");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);

        if (!hasLetter || !hasDigit) {
            setError("Password must contain both letters and digits");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        startTransition(async () => {
            const result = await updatePassword(password);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => router.push("/"), 2000);
            } else {
                setError(result.error || "Failed to update password");
            }
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                        Password updated!
                    </h1>
                    <p className="text-slate-600 dark:text-neutral-400">
                        Redirecting you to the homepage...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-neutral-900 rounded-md border-2 border-slate-300 dark:border-neutral-700 p-6 sm:p-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-2">
                        Reset your password
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-neutral-400 mb-6">
                        Enter your new password below
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-neutral-300">
                                New password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    required
                                    disabled={isPending}
                                    style={{ width: '100%' }}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password requirements */}
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={password.length >= 8 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-neutral-500"}>
                                            {password.length >= 8 ? "✓" : "○"}
                                        </span>
                                        <span className={password.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-neutral-400"}>
                                            At least 8 characters
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={/[a-zA-Z]/.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-neutral-500"}>
                                            {/[a-zA-Z]/.test(password) ? "✓" : "○"}
                                        </span>
                                        <span className={/[a-zA-Z]/.test(password) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-neutral-400"}>
                                            Contains letters
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={/[0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-neutral-500"}>
                                            {/[0-9]/.test(password) ? "✓" : "○"}
                                        </span>
                                        <span className={/[0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-neutral-400"}>
                                            Contains digits
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-neutral-300">
                                Confirm new password
                            </label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Enter password again"
                                required
                                disabled={isPending}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={isPending || !password.trim() || !confirmPassword.trim()}
                            style={{ width: '100%' }}
                            className="font-semibold"
                        >
                            {isPending ? "Updating password..." : "Update password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
