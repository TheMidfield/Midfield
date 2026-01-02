"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Flame, Shield, Sparkles, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

    // Consistent card styling - no background difference
    const baseClasses = "flex items-start gap-2.5 p-2 rounded-md transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800/50";

    // Unread indicator - blue dot
    const UnreadDot = () => !isRead ? (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
    ) : <div className="w-1.5 shrink-0" />;

    // Get type-specific icon
    const getTypeConfig = () => {
        switch (notification.type) {
            case 'reply':
                return { Icon: MessageSquare, bg: "bg-blue-500" };
            case 'upvote':
                return { Icon: Flame, bg: "bg-emerald-500" };
            case 'badge_received':
                return { Icon: Shield, bg: "bg-amber-500" };
            case 'system_welcome':
                return { Icon: Sparkles, bg: "bg-emerald-500" };
            default:
                return { Icon: MessageSquare, bg: "bg-slate-500" };
        }
    };

    const { Icon, bg } = getTypeConfig();

    // Render entity image or fallback
    const EntityImage = () => {
        const entity = notification.entity;
        const hasImage = entity?.imageUrl;

        return (
            <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {hasImage ? (
                        <Image
                            src={entity.imageUrl!}
                            alt={entity.title}
                            width={32}
                            height={32}
                            className={cn(
                                "object-contain",
                                entity.type === 'player' ? "object-top scale-150 translate-y-1" : ""
                            )}
                            unoptimized
                        />
                    ) : (
                        <User className="w-4 h-4 text-slate-300 dark:text-neutral-600" />
                    )}
                </div>
                {/* Type badge */}
                <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center", bg)}>
                    <Icon className="w-2 h-2 text-white" />
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (notification.type) {
            case 'reply':
                return (
                    <>
                        <EntityImage />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-snug">
                                <span className="font-semibold text-slate-700 dark:text-neutral-200">@{notification.actor?.username}</span> replied to your take
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'upvote':
                return (
                    <>
                        <EntityImage />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-snug">
                                <span className="font-semibold text-slate-700 dark:text-neutral-200">@{notification.actor?.username}</span> upvoted your take
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
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
                        <div className="shrink-0 w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-snug">
                                You unlocked <span className="font-semibold text-amber-600 dark:text-amber-400">{badgeText}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'system_welcome':
                return (
                    <>
                        <div className="shrink-0 w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-slate-700 dark:text-neutral-200">
                                Welcome to Midfield!
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">Let's get you started</p>
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
