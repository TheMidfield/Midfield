"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Typography } from "@/components/ui/Typography";
import { Toast } from "@/components/ui/Toast";
import { Calendar, Trophy, Shield, Home, Plane } from "lucide-react";
import NextImage from "next/image";

export function ModalShowcase() {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        variant: "default" | "danger" | "warning";
        title: string;
        message: string;
        confirmText: string;
    }>({
        isOpen: false,
        variant: "default",
        title: "",
        message: "",
        confirmText: ""
    });

    const [toastState, setToastState] = useState<{ message: string | null; type: 'success' | 'error' }>({ message: null, type: 'success' });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToastState({ message, type });
        setTimeout(() => setToastState(prev => prev.message === message ? { message: null, type: 'success' } : prev), 3000);
    };

    const openModal = (variant: "default" | "danger" | "warning") => {
        const config = {
            default: {
                title: "Confirm Action",
                message: "Are you sure you want to proceed with this action?",
                confirmText: "Confirm"
            },
            danger: {
                title: "Delete Account",
                message: "This action cannot be undone. All your data will be permanently removed.",
                confirmText: "Delete Account"
            },
            warning: {
                title: "Unsaved Changes",
                message: "You have unsaved changes. Are you sure you want to leave?",
                confirmText: "Leave Anyway"
            }
        };

        setModalState({
            isOpen: true,
            variant,
            ...config[variant]
        });
    };

    const handleModalConfirm = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (modalState.variant === 'danger') {
            showToast("Account deleted successfully", 'success');
        } else if (modalState.variant === 'warning') {
            showToast("Changes discarded", 'success');
        } else {
            showToast("Action confirmed", 'success');
        }
    };

    return (
        <div className="space-y-8">
            <Toast message={toastState.message} type={toastState.type} />

            {/* System Modals */}
            <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                <Typography variant="h3">System Modals</Typography>
                <p className="text-slate-500 dark:text-neutral-400">
                    Controlled modals for confirmations, warnings, and destructive actions.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={() => openModal("default")}>
                        Default Confirm
                    </Button>
                    <Button variant="destructive" onClick={() => openModal("danger")}>
                        Danger / Delete
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => openModal("warning")}
                        className="bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
                    >
                        Warning
                    </Button>
                </div>
            </div>

            {/* Toast Notifications */}
            <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                <Typography variant="h3">Toast Notifications</Typography>
                <p className="text-slate-500 dark:text-neutral-400">
                    Non-intrusive feedback for user actions.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={() => showToast("Operation successful", 'success')}>
                        Trigger Success Toast
                    </Button>
                    <Button
                        variant="outline"
                        className="border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                        onClick={() => showToast("Something went wrong", 'error')}
                    >
                        Trigger Error Toast
                    </Button>
                </div>
            </div>

            {/* Match Center Widget Tabs */}
            <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                <Typography variant="h3">Match Center Tabs</Typography>
                <p className="text-slate-500 dark:text-neutral-400">
                    Clean tab design with icons, emerald active state, subtle divider.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button className="flex items-center gap-2 font-bold text-sm transition-all cursor-pointer text-emerald-600 dark:text-emerald-400">
                        <Calendar className="w-4 h-4" />
                        Upcoming
                    </button>
                    <div className="w-px h-4 bg-slate-100 dark:bg-neutral-800" />
                    <button className="flex items-center gap-2 font-bold text-sm transition-all cursor-pointer text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300">
                        <Trophy className="w-4 h-4" />
                        Results
                    </button>
                </div>
            </div>

            {/* Fixture Row Example */}
            <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                <Typography variant="h3">Fixture Rows</Typography>
                <p className="text-slate-500 dark:text-neutral-400">
                    Clean fixture rows with date, team badges, clickable opponents with hover effects.
                </p>

                {/* Upcoming Match Row */}
                <div>
                    <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-2">Upcoming Match</span>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50">
                        {/* Date */}
                        <div className="w-10 sm:w-12 text-center shrink-0">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400 block">
                                1 Jan
                            </span>
                        </div>

                        {/* Home/Away indicator */}
                        <div className="w-4 shrink-0 flex items-center justify-center">
                            <Home className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                        </div>

                        {/* Opponent */}
                        <div className="flex items-center gap-2 flex-1 min-w-0 group">
                            <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                                <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                Arsenal
                            </span>
                        </div>

                        {/* Time */}
                        <div className="shrink-0 text-right">
                            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400">
                                15:00
                            </span>
                        </div>
                    </div>
                </div>

                {/* Result Row */}
                <div>
                    <span className="text-xs text-slate-400 dark:text-neutral-500 block mb-2">Past Result</span>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-md bg-slate-50 dark:bg-neutral-800/50">
                        {/* Date */}
                        <div className="w-10 sm:w-12 text-center shrink-0">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400 block">
                                28 Dec
                            </span>
                        </div>

                        {/* Home/Away indicator */}
                        <div className="w-4 shrink-0 flex items-center justify-center">
                            <Plane className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                        </div>

                        {/* Opponent */}
                        <div className="flex items-center gap-2 flex-1 min-w-0 group">
                            <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                                <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                Chelsea
                            </span>
                        </div>

                        {/* Score */}
                        <div className="shrink-0 text-right">
                            <span className="font-bold text-sm text-slate-900 dark:text-neutral-100">
                                2–1
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Badges (From Last 5 Matches) */}
            <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                <Typography variant="h3">Score Badges</Typography>
                <p className="text-slate-500 dark:text-neutral-400">
                    Outlined score badges with lighter backgrounds - used in Last 5 Matches display.
                </p>
                <div className="flex items-center justify-center gap-4">
                    {/* Win */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="px-2 py-0.5 rounded font-black text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-600 dark:border-emerald-500">
                            3–1
                        </div>
                        <div className="relative w-7 h-7 hover:scale-110 transition-transform">
                            <div className="w-full h-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-slate-400 dark:text-neutral-500" />
                            </div>
                        </div>
                    </div>

                    {/* Draw */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="px-2 py-0.5 rounded font-black text-[11px] bg-slate-50 dark:bg-neutral-800/50 text-slate-700 dark:text-neutral-300 border-2 border-slate-400 dark:border-neutral-600">
                            1–1
                        </div>
                        <div className="relative w-7 h-7 hover:scale-110 transition-transform">
                            <div className="w-full h-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-slate-400 dark:text-neutral-500" />
                            </div>
                        </div>
                    </div>

                    {/* Loss */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="px-2 py-0.5 rounded font-black text-[11px] bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-2 border-rose-600 dark:border-rose-500">
                            0–2
                        </div>
                        <div className="relative w-7 h-7 hover:scale-110 transition-transform">
                            <div className="w-full h-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-slate-400 dark:text-neutral-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleModalConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                variant={modalState.variant}
            />
        </div>
    );
}
