"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCount } from "@/app/actions/notifications";
import { Toast } from "@/components/ui/Toast";

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    refreshNotifications: () => void;
    lastNotificationTrigger: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [lastNotificationTrigger, setLastNotificationTrigger] = useState(0);

    // Use ref to avoid recreating supabase client on each render
    const supabaseRef = useRef(createClient());

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
        const supabase = supabaseRef.current;
        let channel: ReturnType<typeof supabase.channel> | null = null;
        let mounted = true;

        const setupSubscription = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user || !mounted) {
                    console.log('[Notifications] No user found or unmounted');
                    return;
                }

                console.log('[Notifications] Setting up realtime for user:', user.id);

                channel = supabase
                    .channel(`user-notifications-${user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notifications',
                            filter: `recipient_id=eq.${user.id}`,
                        },
                        async (payload) => {
                            console.log('[Notifications] Realtime event received:', payload);
                            if (!mounted) return;

                            await refreshUnreadCount();
                            refreshNotifications();
                            setToastMessage("You have new notifications");
                            setToastType('success');
                        }
                    )
                    .subscribe((status, err) => {
                        console.log('[Notifications] Subscription status:', status, err);
                    });
            } catch (error) {
                console.error('[Notifications] Setup error:', error);
            }
        };

        setupSubscription();

        return () => {
            mounted = false;
            if (channel) {
                console.log('[Notifications] Cleaning up channel');
                supabaseRef.current.removeChannel(channel);
            }
        };
    }, [refreshUnreadCount, refreshNotifications]);

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
