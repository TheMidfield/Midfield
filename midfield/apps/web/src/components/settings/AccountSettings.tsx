"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateEmail, updatePassword } from "@/app/auth/actions";
import { Eye, EyeOff } from "lucide-react";

interface AccountSettingsProps {
    currentEmail: string;
}

export function AccountSettings({ currentEmail }: AccountSettingsProps) {
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    const [emailSuccess, setEmailSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleEmailChange = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setEmailSuccess(false);

        if (!newEmail.trim()) {
            setError("Please enter a new email address");
            return;
        }

        if (newEmail === currentEmail) {
            setError("New email is the same as current email");
            return;
        }

        startTransition(async () => {
            const result = await updateEmail(newEmail);
            if (result.success) {
                setEmailSuccess(true);
                setNewEmail("");
            } else {
                setError(result.error || "Failed to update email");
            }
        });
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setPasswordSuccess(false);

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setError("Please fill in all password fields");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasDigit = /[0-9]/.test(newPassword);

        if (!hasLetter || !hasDigit) {
            setError("Password must contain both letters and digits");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        startTransition(async () => {
            const result = await updatePassword(newPassword);
            if (result.success) {
                setPasswordSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(result.error || "Failed to update password");
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Email Change Section */}
            <div className="bg-white dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-800 rounded-md p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-4">
                    Email Address
                </h3>

                {emailSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-md">
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            ✓ Confirmation email sent! Check your new email inbox to confirm the change.
                        </p>
                    </div>
                )}

                {error && !passwordSuccess && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleEmailChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                            Current email
                        </label>
                        <div className="px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-md text-sm text-slate-600 dark:text-neutral-400">
                            {currentEmail}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                            New email address
                        </label>
                        <Input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="new@example.com"
                            disabled={isPending}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending || !newEmail.trim()}
                        className="w-full sm:w-auto"
                    >
                        {isPending ? "Sending confirmation..." : "Update email"}
                    </Button>
                </form>

                <p className="mt-4 text-xs text-slate-500 dark:text-neutral-400">
                    You'll receive a confirmation email at your new address. Click the link to complete the change.
                </p>
            </div>

            {/* Password Change Section */}
            <div className="bg-white dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-800 rounded-md p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-4">
                    Password
                </h3>

                {passwordSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-md">
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            ✓ Password updated successfully!
                        </p>
                    </div>
                )}

                {error && !emailSuccess && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                            New password
                        </label>
                        <div className="relative">
                            <Input
                                type={showPasswords ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                disabled={isPending}
                                style={{ width: '100%' }}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                                tabIndex={-1}
                            >
                                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password requirements */}
                        {newPassword.length > 0 && (
                            <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={newPassword.length >= 8 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-neutral-500"}>
                                        {newPassword.length >= 8 ? "✓" : "○"}
                                    </span>
                                    <span className={newPassword.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-neutral-400"}>
                                        At least 8 characters
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={/[a-zA-Z]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-neutral-500"}>
                                        {/[a-zA-Z]/.test(newPassword) ? "✓" : "○"}
                                    </span>
                                    <span className={/[a-zA-Z]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-neutral-400"}>
                                        Contains letters
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={/[0-9]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-neutral-500"}>
                                        {/[0-9]/.test(newPassword) ? "✓" : "○"}
                                    </span>
                                    <span className={/[0-9]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-neutral-400"}>
                                        Contains digits
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                            Confirm new password
                        </label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Enter password again"
                            disabled={isPending}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending || !newPassword.trim() || !confirmPassword.trim()}
                        className="w-full sm:w-auto"
                    >
                        {isPending ? "Updating..." : "Update password"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
