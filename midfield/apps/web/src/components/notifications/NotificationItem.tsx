"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Flame, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { Notification } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

interface NotificationItemProps {
    notification: Notification;
    onRead: () => void;
    onWelcomeClick: () => void;
    onBadgeClick: (badgeId: string) => void;
}

export function NotificationItem({ notification, onRead, onWelcomeClick, onBadgeClick }: NotificationItemProps) {
    const isRead = notification.is_read;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    const baseClasses = cn(
        "flex items-start gap-3 p-2.5 rounded-md transition-colors cursor-pointer",
        isRead
            ? "bg-transparent hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            : "bg-slate-50 dark:bg-neutral-800/30 hover:bg-slate-100 dark:hover:bg-neutral-800/50"
    );

    const renderContent = () => {
        switch (notification.type) {
            case 'reply':
                return (
                    <>
                        <div className="relative shrink-0">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.actor?.avatar_url || ''} />
                                <AvatarFallback className="text-[10px]">{notification.actor?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                <MessageSquare className="w-2 h-2" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                                <span className="font-semibold text-slate-800 dark:text-neutral-100">{notification.actor?.username}</span> replied to your take
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                    </>
                );
            case 'upvote':
                return (
                    <>
                        <div className="relative shrink-0">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.actor?.avatar_url || ''} />
                                <AvatarFallback className="text-[10px]">{notification.actor?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                <Flame className="w-2 h-2" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                                <span className="font-semibold text-slate-800 dark:text-neutral-100">{notification.actor?.username}</span> upvoted your take
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                    </>
                );
            case 'badge_received':
                const badgeText = notification.resource_slug
                    ? notification.resource_slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : 'New Badge';
                return (
                    <>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                                You unlocked <span className="font-semibold text-amber-600 dark:text-amber-400">{badgeText}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                    </>
                );
            case 'system_welcome':
                return (
                    <>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-neutral-100">
                                Welcome to Midfield!
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">Let's get you started</p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    // Unread indicator
    const UnreadDot = () => !isRead ? (
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2.5" />
    ) : null;

    if (notification.type === 'system_welcome') {
        return (
            <div onClick={() => { onRead(); onWelcomeClick(); }} className={baseClasses}>
                {renderContent()}
                <UnreadDot />
            </div>
        );
    }

    if (notification.type === 'badge_received') {
        const badgeId = notification.resource_slug || '';
        return (
            <div onClick={() => { onRead(); onBadgeClick(badgeId); }} className={baseClasses}>
                {renderContent()}
                <UnreadDot />
            </div>
        );
    }

    const href = notification.resource_slug ? `/topic/${notification.resource_slug}` : '#';

    return (
        <Link href={href} onClick={onRead} className={baseClasses}>
            {renderContent()}
            <UnreadDot />
        </Link>
    );
}
