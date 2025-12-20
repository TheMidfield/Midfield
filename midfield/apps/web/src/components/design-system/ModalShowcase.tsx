"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Typography } from "@/components/ui/Typography";
import { Toast } from "@/components/ui/Toast";
import { Bell } from "lucide-react";

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
        // Reset state after animation duration to allow re-triggering same message cleanly if needed
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

        // Simulate action success
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

            {/* Modals Section */}
            <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                <Typography variant="h3">System Modals</Typography>
                <p className="text-slate-500 dark:text-neutral-400">
                    Controlled modals for confirmations, warnings, and destructive actions.
                    Uses <code>fixed</code> positioning and focuses on content clarity.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Button
                        variant="outline"
                        onClick={() => openModal("default")}
                    >
                        Default Confirm
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => openModal("danger")}
                    >
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

            {/* Toasts Section */}
            <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                <Typography variant="h3">Toast Notifications</Typography>
                <p className="text-slate-500 dark:text-neutral-400">
                    Non-intrusive feedbacks for user actions.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Button
                        variant="outline"
                        icon={Bell}
                        onClick={() => showToast("Operation successful", 'success')}
                    >
                        Trigger Success Toast
                    </Button>
                    <Button
                        variant="outline"
                        icon={Bell}
                        className="border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                        onClick={() => showToast("Something went wrong", 'error')}
                    >
                        Trigger Error Toast
                    </Button>
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
