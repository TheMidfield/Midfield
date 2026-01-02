"use client";

import { useState, useEffect } from "react";
import { Check, X, Bell } from "lucide-react";

export interface ToastProps {
    message: string | null;
    type: 'success' | 'error' | 'notification';
    duration?: number;
    onClose?: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | null>(null);
    const [currentType, setCurrentType] = useState<'success' | 'error' | 'notification'>('success');

    useEffect(() => {
        if (message) {
            setCurrentMessage(message);
            setCurrentType(type);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });

            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [message, type, duration, onClose]);

    useEffect(() => {
        if (!visible && !message && currentMessage) {
            const timer = setTimeout(() => setCurrentMessage(null), 300);
            return () => clearTimeout(timer);
        }
    }, [visible, message, currentMessage]);

    if (!currentMessage) return null;

    const isSuccess = currentType === 'success';
    const isNotification = currentType === 'notification';
    const isError = currentType === 'error';

    const getBorderColor = () => {
        if (isNotification) return 'border-blue-500/50 dark:border-blue-700';
        if (isSuccess) return 'border-emerald-500/50 dark:border-emerald-700';
        return 'border-red-500/50 dark:border-red-700';
    };

    const getIconBgColor = () => {
        if (isNotification) return 'bg-blue-100 dark:bg-blue-900/50';
        if (isSuccess) return 'bg-emerald-100 dark:bg-emerald-900/50';
        return 'bg-red-100 dark:bg-red-900/50';
    };

    const renderIcon = () => {
        if (isNotification) return <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
        if (isSuccess) return <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
        return <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
    };

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
            className={`bg-white dark:bg-neutral-900 border-2 ${getBorderColor()}`}
        >
            <div
                style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                className={getIconBgColor()}
            >
                {renderIcon()}
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-neutral-200" style={{ whiteSpace: 'nowrap' }}>{currentMessage}</p>
        </div>
    );
}
