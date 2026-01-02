"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Flame, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { Notification } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
    notification: Notification;
    onRead: () => void;
    onWelcomeClick: () => void;
    onBadgeClick: (badgeId: string) => void;
}

export function NotificationItem({ notification, onRead, onWelcomeClick, onBadgeClick }: NotificationItemProps) {
    const isRead = notification.is_read;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    // Consistent card styling - no background difference for read/unread
    const baseClasses = "flex items-start gap-3 p-3 rounded-md transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800/50";

    // Unread indicator - blue dot for consistency
    const UnreadDot = () => !isRead ? (
        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
    ) : <div className="w-2 shrink-0" />; // Spacer for alignment

    // Get type-specific icon and colors
    const getTypeIcon = () => {
        switch (notification.type) {
            case 'reply':
                return { Icon: MessageSquare, bg: "bg-blue-500", color: "text-white" };
            case 'upvote':
                return { Icon: Flame, bg: "bg-emerald-500", color: "text-white" };
            case 'badge_received':
                return { Icon: Shield, bg: "bg-amber-500", color: "text-white" };
            case 'system_welcome':
                return { Icon: Sparkles, bg: "bg-emerald-500", color: "text-white" };
            default:
                return { Icon: MessageSquare, bg: "bg-slate-500", color: "text-white" };
        }
    };

    const { Icon, bg, color } = getTypeIcon();

    const renderContent = () => {
        switch (notification.type) {
            case 'reply':
                return (
                    <>
                        <div className="relative shrink-0">
                            {/* Entity image placeholder - using a gradient for now */}
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center overflow-hidden">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500">TAKE</span>
                            </div>
                            {/* Type indicator badge */}
                            <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center", bg)}>
                                <Icon className={cn("w-2.5 h-2.5", color)} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-700 dark:text-neutral-200 leading-snug">
                                <span className="font-semibold">{notification.actor?.username}</span> replied to your take
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'upvote':
                return (
                    <>
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center overflow-hidden">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500">TAKE</span>
                            </div>
                            <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center", bg)}>
                                <Icon className={cn("w-2.5 h-2.5", color)} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-700 dark:text-neutral-200 leading-snug">
                                <span className="font-semibold">{notification.actor?.username}</span> upvoted your take
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'badge_received':
                const badgeText = notification.resource_slug
                    ? notification.resource_slug.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : 'New Badge';
                return (
                    <>
                        <div className="shrink-0 w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-700 dark:text-neutral-200 leading-snug">
                                You unlocked <span className="font-semibold text-amber-600 dark:text-amber-400">{badgeText}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'system_welcome':
                return (
                    <>
                        <div className="shrink-0 w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 dark:text-neutral-200">
                                Welcome to Midfield!
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">Let's get you started</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            default:
                return null;
        }
    };

    if (notification.type === 'system_welcome') {
        return (
            <div onClick={() => { onRead(); onWelcomeClick(); }} className={baseClasses}>
                {renderContent()}
            </div>
        );
    }

    if (notification.type === 'badge_received') {
        const badgeId = notification.resource_slug || '';
        return (
            <div onClick={() => { onRead(); onBadgeClick(badgeId); }} className={baseClasses}>
                {renderContent()}
            </div>
        );
    }

    const href = notification.resource_slug ? `/topic/${notification.resource_slug}` : '#';

    return (
        <Link href={href} onClick={onRead} className={baseClasses}>
            {renderContent()}
        </Link>
    );
}
