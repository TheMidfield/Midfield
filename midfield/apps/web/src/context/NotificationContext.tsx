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
                async (payload) => {
                    // Update unread count immediately (optimistic +1 or fetch)
                    // Let's fetch to be accurate
                    await refreshUnreadCount();
                    refreshNotifications();

                    // Handle Toast
                    // We need to fetch details to show a nice message
                    const newNotif = payload.new as any;

                    try {
                        // We fetch just the single new item to get actor/badge details
                        // Alternatively, assume it's the latest one and fetch top 1

                        let message = "You have a new notification";

                        if (newNotif.type === 'system_welcome') {
                            message = "✨ Welcome to Midfield!";
                        } else if (newNotif.type === 'badge_received') {
                            // Uses the resource_slug we patched into the trigger!
                            const badgeName = newNotif.resource_slug
                                ? newNotif.resource_slug.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                                : 'New Badge';
                            message = `🏆 Unlocked: ${badgeName}!`;
                        } else if (newNotif.type === 'reply') {
                            // For reply/upvote we need actor name. 
                            // Fetch via server action or simple client query
                            const { data: actor } = await supabase
                                .from('users')
                                .select('username')
                                .eq('id', newNotif.actor_id)
                                .single();

                            const actorName = actor?.username || 'Someone';
                            message = `💬 ${actorName} replied to your take`;
                        } else if (newNotif.type === 'upvote') {
                            const { data: actor } = await supabase
                                .from('users')
                                .select('username')
                                .eq('id', newNotif.actor_id)
                                .single();

                            const actorName = actor?.username || 'Someone';
                            message = `🔥 ${actorName} upvoted your take`;
                        }

                        setToastMessage(message);
                        setToastType('success');

                        // Play sound? (Maybe later)

                    } catch (e) {
                        console.error("Error processing notification toast", e);
                        setToastMessage("You have a new notification");
                    }
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
