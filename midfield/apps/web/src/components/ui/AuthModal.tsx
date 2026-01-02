"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { X, Mail, Sparkles, MessageSquare, TrendingUp, Speech } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "@/app/auth/actions";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Context for why we're showing this - impacts copy */
    context?: "take" | "reply" | "bookmark" | "default";
}

export function AuthModal({
    isOpen,
    onClose,
    context = "default"
}: AuthModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Focus trap & body scroll lock
    useEffect(() => {
        if (isOpen) {
            modalRef.current?.focus();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSent(false);
            setError(null);
            setEmail("");
        }
    }, [isOpen]);

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

    if (!isOpen) return null;

    // Context-specific headlines
    const getContextCopy = () => {
        switch (context) {
            case "take":
                return {
                    icon: <Speech className="w-5 h-5" />,
                    headline: "Share your take",
                    subheadline: "Join the conversation with football fans worldwide"
                };
            case "reply":
                return {
                    icon: <MessageSquare className="w-5 h-5" />,
                    headline: "Join the debate",
                    subheadline: "Sign in to reply and share your perspective"
                };
            case "bookmark":
                return {
                    icon: <TrendingUp className="w-5 h-5" />,
                    headline: "Save for later",
                    subheadline: "Create an account to bookmark topics and never miss a take"
                };
            default:
                return {
                    icon: <Sparkles className="w-5 h-5" />,
                    headline: "Join Midfield",
                    subheadline: "Where football debate meets data-driven analysis"
                };
        }
    };

    const { icon, headline, subheadline } = getContextCopy();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" />

            {/* Modal */}
            <div
                ref={modalRef}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white dark:bg-neutral-900 rounded-md border-2 border-slate-300 dark:border-neutral-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl"
                style={{ width: 'calc(100% - 2rem)', maxWidth: '460px' }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-1 sm:p-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>

                {/* Success State */}
                {sent ? (
                    <div className="p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
                        <div className="mb-3 sm:mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100">
                            Check your email
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400">
                            We sent a magic link to
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-neutral-100 break-all px-4">
                            {email}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 pt-3 sm:pt-4">
                            Click the link to sign in. You can close this window.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header with gradient accent */}
                        <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-5 md:pb-6 bg-gradient-to-br from-emerald-50 to-white dark:from-neutral-800 dark:to-neutral-900 border-b border-slate-100 dark:border-neutral-800/50">
                            <div className="relative flex items-center gap-3 sm:gap-4">
                                {/* Icon Accent */}
                                <div className="shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white">
                                    {icon}
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1 pr-6">
                                    {/* Headline */}
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-neutral-100 leading-tight">
                                        {headline}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 leading-tight">
                                        {subheadline}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                            {error && (
                                <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 break-words">{error}</p>
                                </div>
                            )}

                            {/* Google OAuth Button - Regular Premium Style */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isPending}
                                style={{ width: '100%' }}
                                className="inline-flex items-center justify-center gap-2 sm:gap-3 h-10 sm:h-11 md:h-12 px-4 sm:px-6 rounded-md border-2 border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 font-bold hover:border-slate-400 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98] lg:active:scale-100 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm sm:text-base"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 sm:w-5 h-4 sm:h-5 shrink-0">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>{isPending ? "Connecting..." : "Continue with Google"}</span>
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-slate-200 dark:border-neutral-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 font-medium">
                                        Or with email
                                    </span>
                                </div>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-neutral-300">
                                        Email address
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        disabled={isPending}
                                        style={{ width: '100%' }}
                                        className="h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={isPending || !email.trim()}
                                    style={{ width: '100%' }}
                                    className="h-10 sm:h-11 md:h-12 text-sm sm:text-base font-semibold"
                                >
                                    {isPending ? "Sending..." : "Send magic link"}
                                </Button>
                            </form>

                            {/* Footer copy */}
                            <p className="text-[10px] xs:text-xs text-center text-slate-500 dark:text-neutral-500">
                                By continuing, you agree to our{" "}
                                <span className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                                    Terms
                                </span>{" "}
                                and{" "}
                                <span className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                                    Privacy Policy
                                </span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
