"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { getNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from "@/app/actions/notifications";
import { NotificationItem } from "./NotificationItem";
import { WelcomeModal } from "./WelcomeModal";
import { useNotification } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

export function NotificationsPopover() {
    const { unreadCount, refreshUnreadCount, lastNotificationTrigger } = useNotification();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

    // Fetch on open or trigger
    useEffect(() => {
        if (open) {
            setLoading(true);
            getNotifications(0, 20).then((res) => {
                setNotifications(res.notifications);
                setLoading(false);
                // If open, we might want to verify unread count sync
                refreshUnreadCount();
            });
        }
    }, [open, lastNotificationTrigger, refreshUnreadCount]);

    const handleMarkAllRead = async () => {
        const success = await markAllNotificationsRead();
        if (success.success) {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            refreshUnreadCount();
        }
    };

    const handleRead = async (id: string) => {
        // Optimistic
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await markNotificationRead(id);
        refreshUnreadCount();
    };

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-9 h-9 rounded-md" // Exact match to ThemeToggle/IconButton size="sm"
                        >
                            <Bell className={cn(
                                "w-4 h-4 transition-colors", // Icon size match
                                unreadCount > 0 ? "text-slate-900 dark:text-neutral-100" : "text-slate-500 dark:text-neutral-400"
                            )} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 flex h-2 w-2 translate-x-1/2 -translate-y-1/2">
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border-2 border-white dark:border-neutral-950"></span>
                                </span>
                            )}
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 overflow-hidden border-slate-200 dark:border-neutral-800 shadow-xl mt-2" align="end" sideOffset={8}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 border-none">
                        <h4 className="font-display font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-500">Notifications</h4>
                        {notifications.some(n => !n.is_read) && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                                <div className="animate-pulse w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-800 mx-auto" />
                                <div className="animate-pulse h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded mx-auto" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="p-2 space-y-0.5">
                                {notifications.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={() => handleRead(n.id)}
                                        onWelcomeClick={() => {
                                            setOpen(false); // Close popover
                                            setIsWelcomeOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500 dark:text-neutral-500">
                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">All caught up!</p>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <WelcomeModal
                isOpen={isWelcomeOpen}
                onClose={() => setIsWelcomeOpen(false)}
            />
        </>
    );
}

// Export Bell as the main component usage
export { NotificationsPopover as NotificationBell };
