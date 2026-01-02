"use client";

import { useEffect, useState } from "react";
import { Bell, X, ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/Sheet";
import { IconButton } from "@/components/ui/IconButton";
import { getNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from "@/app/actions/notifications";
import { NotificationItem } from "./NotificationItem";
import { WelcomeModal } from "./WelcomeModal";
import { BadgeModal } from "@/components/profile/BadgeModal";
import { useNotification } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

interface NotificationsSidebarProps {
    onOpenChange?: (open: boolean) => void;
}

export function NotificationsSidebar({ onOpenChange }: NotificationsSidebarProps) {
    const { unreadCount, refreshUnreadCount, lastNotificationTrigger } = useNotification();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        onOpenChange?.(isOpen);
    };

    const closeSidebar = () => handleOpenChange(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getNotifications(0, 30).then((res) => {
                setNotifications(res.notifications);
                setLoading(false);
                refreshUnreadCount();
            });
        }
    }, [open, lastNotificationTrigger, refreshUnreadCount]);

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        refreshUnreadCount();
        await markAllNotificationsRead();
    };

    const handleRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await markNotificationRead(id);
        refreshUnreadCount();
    };

    const hasUnread = notifications.some(n => !n.is_read);

    return (
        <>
            <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
                <SheetTrigger asChild>
                    <div className="relative">
                        <IconButton
                            icon={Bell}
                            variant="ghost"
                            size="sm"
                            aria-label="Notifications"
                            className={cn(
                                "transition-all duration-150",
                                open && "bg-slate-100 dark:bg-neutral-800"
                            )}
                        />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                    </div>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col">
                    {/* Header - different layout for mobile */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-neutral-800">
                        {/* Mobile: back arrow. Desktop: title */}
                        <div className="flex items-center gap-2">
                            <SheetClose asChild className="sm:hidden">
                                <button className="rounded-md p-1 -ml-1 text-slate-500 dark:text-neutral-400 transition-colors hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </SheetClose>
                            <span className="text-sm sm:text-[11px] font-semibold sm:uppercase tracking-normal sm:tracking-wider text-slate-800 dark:text-neutral-200 sm:text-slate-500 sm:dark:text-neutral-500">
                                Notifications
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasUnread && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[12px] sm:text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                    Mark all read
                                </button>
                            )}
                            {/* Desktop only: X close button */}
                            <SheetClose asChild className="hidden sm:block">
                                <button className="rounded-md p-1 text-slate-400 dark:text-neutral-500 transition-colors hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer">
                                    <X className="h-4 w-4" />
                                </button>
                            </SheetClose>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center space-y-3">
                                <div className="animate-pulse w-6 h-6 rounded-full bg-slate-100 dark:bg-neutral-800 mx-auto" />
                                <div className="animate-pulse h-3 w-20 bg-slate-100 dark:bg-neutral-800 rounded mx-auto" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="py-2 px-2 sm:px-2">
                                {notifications.map((n) => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={() => handleRead(n.id)}
                                        onNavigate={closeSidebar}
                                        onWelcomeClick={() => {
                                            // Keep sidebar open for modals
                                            setIsWelcomeOpen(true);
                                        }}
                                        onBadgeClick={(badgeId) => {
                                            // Keep sidebar open for badges
                                            setSelectedBadge(badgeId);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 px-6 text-center">
                                <Bell className="w-8 h-8 sm:w-6 sm:h-6 mx-auto mb-3 text-slate-200 dark:text-neutral-700" />
                                <p className="text-sm sm:text-xs text-slate-400 dark:text-neutral-500">All caught up!</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

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

export { NotificationsSidebar as NotificationBell };
