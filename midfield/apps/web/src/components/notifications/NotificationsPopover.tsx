"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { IconButton } from "@/components/ui/IconButton";
import { getNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from "@/app/actions/notifications";
import { NotificationItem } from "./NotificationItem";
import { WelcomeModal } from "./WelcomeModal";
import { BadgeModal } from "@/components/profile/BadgeModal";
import { useNotification } from "@/context/NotificationContext";

export function NotificationsPopover() {
    const { unreadCount, refreshUnreadCount, lastNotificationTrigger } = useNotification();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getNotifications(0, 20).then((res) => {
                setNotifications(res.notifications);
                setLoading(false);
                refreshUnreadCount();
            });
        }
    }, [open, lastNotificationTrigger, refreshUnreadCount]);

    const handleMarkAllRead = async () => {
        // Instant optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        // Trigger refresh to update bell icon immediately
        refreshUnreadCount();
        // Then persist to backend
        await markAllNotificationsRead();
    };

    const handleRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await markNotificationRead(id);
        refreshUnreadCount();
    };

    // Check if there are any unread notifications
    const hasUnread = notifications.some(n => !n.is_read);

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <IconButton
                            icon={Bell}
                            variant="ghost"
                            size="sm"
                            aria-label="Notifications"
                        />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-72 p-0 overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
                    align="end"
                    sideOffset={20}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-neutral-800">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">Notifications</span>
                        {hasUnread && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-[320px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-6 text-center space-y-2">
                                <div className="animate-pulse w-5 h-5 rounded-full bg-slate-100 dark:bg-neutral-800 mx-auto" />
                                <div className="animate-pulse h-2 w-16 bg-slate-100 dark:bg-neutral-800 rounded mx-auto" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="py-1.5 px-1.5 space-y-0.5">
                                {notifications.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={() => handleRead(n.id)}
                                        onWelcomeClick={() => {
                                            setOpen(false);
                                            setIsWelcomeOpen(true);
                                        }}
                                        onBadgeClick={(badgeId) => {
                                            setOpen(false);
                                            setSelectedBadge(badgeId);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 px-4 text-center">
                                <Bell className="w-5 h-5 mx-auto mb-1.5 text-slate-200 dark:text-neutral-700" />
                                <p className="text-[11px] text-slate-400 dark:text-neutral-500">All caught up!</p>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <WelcomeModal
                isOpen={isWelcomeOpen}
                onClose={() => setIsWelcomeOpen(false)}
            />

            <BadgeModal
                badgeId={selectedBadge}
                onClose={() => setSelectedBadge(null)}
            />
        </>
    );
}

export { NotificationsPopover as NotificationBell };
