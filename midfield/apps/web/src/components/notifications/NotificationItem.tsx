"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Flame, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { Notification } from "@/app/actions/notifications";
import { cn } from "@/lib/utils"; // Assuming utils exists, or use clsx/tailwind-merge directly if not
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

interface NotificationItemProps {
    notification: Notification;
    onRead: () => void;
    onWelcomeClick: () => void;
}

export function NotificationItem({ notification, onRead, onWelcomeClick }: NotificationItemProps) {
    const isRead = notification.is_read;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    // Determine content based on type
    const renderContent = () => {
        switch (notification.type) {
            case 'reply':
                return (
                    <>
                        <div className="relative shrink-0">
                            <Avatar className="w-9 h-9 border border-slate-200 dark:border-neutral-700">
                                <AvatarImage src={notification.actor?.avatar_url || ''} />
                                <AvatarFallback>{notification.actor?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-neutral-900">
                                <MessageSquare className="w-2.5 h-2.5" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 dark:text-neutral-200">
                                <span className="font-semibold text-slate-900 dark:text-white">{notification.actor?.username}</span> replied to your take
                            </p>
                            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                    </>
                );
            case 'upvote':
                return (
                    <>
                        <div className="relative shrink-0">
                            <Avatar className="w-9 h-9 border border-slate-200 dark:border-neutral-700">
                                <AvatarImage src={notification.actor?.avatar_url || ''} />
                                <AvatarFallback>{notification.actor?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-neutral-900">
                                <Flame className="w-2.5 h-2.5" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 dark:text-neutral-200">
                                <span className="font-semibold text-slate-900 dark:text-white">{notification.actor?.username}</span> upvoted your take
                            </p>
                            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                    </>
                );
            case 'badge_received':
                const badgeText = notification.resource_slug
                    ? notification.resource_slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : 'New Badge';
                return (
                    <>
                        <div className="relative shrink-0 w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 dark:text-neutral-200">
                                You unlocked the <span className="font-bold text-amber-600 dark:text-amber-400">{badgeText}</span> badge!
                            </p>
                            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                    </>
                );
            case 'system_welcome':
                return (
                    <>
                        <div className="relative shrink-0 w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                Welcome to Midfield!
                            </p>
                            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Let's get you started.</p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    // Wrapper Logic
    if (notification.type === 'system_welcome') {
        return (
            <div
                onClick={() => { onRead(); onWelcomeClick(); }}
                className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                    isRead ? "bg-transparent hover:bg-slate-50 dark:hover:bg-neutral-800" : "bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                )}
            >
                {renderContent()}
                {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                )}
            </div>
        );
    }

    // For Badge, where do we go? Profile -> Badges (bookmarks page is closest?) or just stay here?
    // Let's go to Profile for now.
    // For Reply/Upvote -> Topic page + resource ID if possible (scrolling).
    // Post Link: /topic/[slug] (we might need post ID anchor #post-id)
    const href = notification.type === 'badge_received'
        ? `/profile`
        : notification.resource_slug
            ? `/topic/${notification.resource_slug}` // Ideally #post-id but resource_id is the Post ID
            : '#';

    return (
        <Link
            href={href}
            onClick={onRead}
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors",
                isRead ? "bg-transparent hover:bg-slate-50 dark:hover:bg-neutral-800" : "bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            )}
        >
            {renderContent()}
            {!isRead && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            )}
        </Link>
    );
}
