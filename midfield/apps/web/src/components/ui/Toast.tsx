"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

export interface ToastProps {
    message: string | null;
    type: 'success' | 'error';
    duration?: number;
    onClose?: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | null>(null);
    const [currentType, setCurrentType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (message) {
            // On enter: update content immediately, then animate in
            setCurrentMessage(message);
            setCurrentType(type);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });

            // Auto-dismiss
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            // On exit: animate out
            setVisible(false);
        }
    }, [message, type, duration, onClose]);

    // Clear content after exit animation completes
    useEffect(() => {
        if (!visible && !message && currentMessage) {
            const timer = setTimeout(() => setCurrentMessage(null), 300);
            return () => clearTimeout(timer);
        }
    }, [visible, message, currentMessage]);

    // Don't render if no content
    if (!currentMessage) return null;

    const isSuccess = currentType === 'success';

    return (
        <div
            style={{
                position: 'fixed',
                top: '96px',
                right: '96px',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                transform: visible ? 'translateY(0)' : 'translateY(-16px)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: visible ? 'auto' : 'none',
            }}
            className={`bg-white dark:bg-neutral-900 border-2 ${isSuccess ? 'border-emerald-500/50 dark:border-emerald-700' : 'border-red-500/50 dark:border-red-700'}`}
        >
            <div
                style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                className={isSuccess ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'}
            >
                {isSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-neutral-200" style={{ whiteSpace: 'nowrap' }}>{currentMessage}</p>
        </div>
    );
}
