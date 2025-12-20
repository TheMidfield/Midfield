"use client";

import { useEffect, useRef, useCallback } from "react";
import { Button } from "./Button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "default";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default"
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

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

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    const handleConfirm = useCallback(() => {
        onConfirm();
        onClose();
    }, [onConfirm, onClose]);

    if (!isOpen) return null;

    const iconColor = variant === "danger"
        ? "text-red-500 dark:text-red-400"
        : variant === "warning"
            ? "text-amber-500 dark:text-amber-400"
            : "text-emerald-500 dark:text-emerald-400";

    const iconBg = variant === "danger"
        ? "bg-red-50 dark:bg-red-900/20"
        : variant === "warning"
            ? "bg-amber-50 dark:bg-amber-900/20"
            : "bg-emerald-50 dark:bg-emerald-900/20";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white dark:bg-neutral-900 rounded-md border-2 border-slate-200 dark:border-neutral-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ width: '100%', maxWidth: '340px', margin: '0 16px' }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
                            <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        {/* Title */}
                        <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                            {title}
                        </h3>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 dark:bg-neutral-800/50 border-t border-slate-200 dark:border-neutral-700">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="min-w-[80px]"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        className="min-w-[80px]"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
