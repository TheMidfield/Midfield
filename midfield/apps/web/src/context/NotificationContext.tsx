"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCount, getNotifications } from "@/app/actions/notifications";
import { Toast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    refreshNotifications: () => void; // Signal to popover to refresh
    lastNotificationTrigger: number; // Timestamp to trigger effect
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [lastNotificationTrigger, setLastNotificationTrigger] = useState(0);
    const router = useRouter();

    const supabase = createClient();

    const refreshUnreadCount = useCallback(async () => {
        const count = await getUnreadCount();
        setUnreadCount(count);
    }, []);

    const refreshNotifications = useCallback(() => {
        setLastNotificationTrigger(Date.now());
    }, []);

    // Initial fetch
    useEffect(() => {
        refreshUnreadCount();
    }, [refreshUnreadCount]);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                async () => {
                    // Update unread count immediately
                    await refreshUnreadCount();
                    refreshNotifications();

                    // Simple, reliable toast message
                    setToastMessage("You have new notifications");
                    setToastType('success');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refreshUnreadCount, supabase]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, refreshNotifications, lastNotificationTrigger }}>
            {children}
            <Toast
                message={toastMessage}
                type={toastType}
                onClose={() => setToastMessage(null)}
                duration={4000}
            />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
