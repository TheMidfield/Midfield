"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, X, Loader2 } from "lucide-react";
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

function NotificationSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 sm:p-2.5 animate-pulse">
            <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-md bg-slate-100 dark:bg-neutral-800" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-slate-100 dark:bg-neutral-800 rounded" />
                <div className="h-2 w-20 bg-slate-100 dark:bg-neutral-800 rounded" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-neutral-800" />
        </div>
    );
}

export function NotificationsSidebar({ onOpenChange }: NotificationsSidebarProps) {
    const { unreadCount, refreshUnreadCount, lastNotificationTrigger } = useNotification();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

    const LIMIT = 15;

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        onOpenChange?.(isOpen);
        if (!isOpen) {
            // Reset pagination when closing
            setOffset(0);
        }
    };

    const closeSidebar = () => handleOpenChange(false);

    useEffect(() => {
        if (open) {
            const isMobile = window.matchMedia('(max-width: 639px)').matches;
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            setLoading(true);
            setOffset(0);
            getNotifications(0, LIMIT).then((res) => {
                setNotifications(res.notifications);
                setHasMore(res.hasMore);
                setLoading(false);
                refreshUnreadCount();
            });
        }
    }, [open, lastNotificationTrigger, refreshUnreadCount]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const newOffset = offset + LIMIT;
        const res = await getNotifications(newOffset, LIMIT);
        setNotifications(prev => [...prev, ...res.notifications]);
        setHasMore(res.hasMore);
        setOffset(newOffset);
        setLoadingMore(false);
    }, [loadingMore, hasMore, offset]);

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
                <SheetContent side="right" className="flex flex-col" onOverlayClick={closeSidebar}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-neutral-800">
                        <span className="text-sm sm:text-[11px] font-semibold sm:uppercase tracking-normal sm:tracking-wider text-slate-800 dark:text-neutral-200 sm:text-slate-500 sm:dark:text-neutral-500">
                            Notifications
                        </span>
                        <div className="flex items-center gap-3">
                            {hasUnread && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[12px] sm:text-[11px] font-medium text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 active:text-emerald-700 dark:active:text-emerald-300 transition-colors cursor-pointer"
                                >
                                    Mark all read
                                </button>
                            )}
                            <SheetClose asChild>
                                <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 sm:p-1.5 text-slate-400 dark:text-neutral-500 transition-colors hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 active:bg-slate-200 dark:active:bg-neutral-700 cursor-pointer">
                                    <span className="text-xs font-medium sm:hidden">Close</span>
                                    <X className="h-5 w-5 sm:h-4 sm:w-4" />
                                </button>
                            </SheetClose>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                        {loading ? (
                            <div className="py-2 px-2">
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                                <NotificationSkeleton />
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
                                            handleRead(n.id);
                                            setIsWelcomeOpen(true);
                                        }}
                                        onBadgeClick={(badgeId) => {
                                            handleRead(n.id);
                                            setSelectedBadge(badgeId);
                                        }}
                                    />
                                ))}

                                {/* Load more button */}
                                {hasMore && (
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="w-full py-3 mt-2 text-[12px] font-medium text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load more'
                                        )}
                                    </button>
                                )}
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
