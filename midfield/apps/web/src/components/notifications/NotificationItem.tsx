"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Smile, Shield, Sparkles, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Notification } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
    notification: Notification;
    onRead: () => void;
    onNavigate: () => void;
    onWelcomeClick: () => void;
    onBadgeClick: (badgeId: string) => void;
}

export function NotificationItem({ notification, onRead, onNavigate, onWelcomeClick, onBadgeClick }: NotificationItemProps) {
    const isRead = notification.is_read;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    const baseClasses = "flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-800/50";

    const UnreadDot = () => !isRead ? (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
    ) : <div className="w-1.5 shrink-0" />;

    // Get type-specific icon
    const getTypeIcon = () => {
        switch (notification.type) {
            case 'reply':
                return MessageSquare;
            case 'upvote':
                return Smile; // Reaction smiley
            case 'badge_received':
                return Shield;
            case 'system_welcome':
                return Sparkles;
            default:
                return MessageSquare;
        }
    };

    const Icon = getTypeIcon();

    // Entity image with square-md type badge
    const EntityImage = () => {
        const entity = notification.entity;
        const hasImage = entity?.imageUrl;

        return (
            <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {hasImage ? (
                        <Image
                            src={entity.imageUrl!}
                            alt={entity.title}
                            width={40}
                            height={40}
                            className={cn(
                                "object-contain",
                                // Player cutout: zoom on head with top margin
                                entity.type === 'player'
                                    ? "object-top scale-[2.2] translate-y-2"
                                    : "p-0.5"
                            )}
                            unoptimized
                        />
                    ) : (
                        <User className="w-5 h-5 text-slate-400 dark:text-neutral-600" />
                    )}
                </div>
                {/* Type badge - square with rounded-md, unified slate color */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-md bg-slate-700 dark:bg-neutral-600 flex items-center justify-center">
                    <Icon className="w-2.5 h-2.5 text-white" />
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
                            <p className="text-[13px] text-slate-700 dark:text-neutral-300 leading-snug">
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">@{notification.actor?.username}</span> replied to your take
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'upvote':
                return (
                    <>
                        <EntityImage />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-700 dark:text-neutral-300 leading-snug">
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">@{notification.actor?.username}</span> reacted to your take
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
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
                        <div className="shrink-0 w-10 h-10 rounded-md bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-700 dark:text-neutral-300 leading-snug">
                                You unlocked <span className="font-semibold text-amber-700 dark:text-amber-400">{badgeText}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">{timeAgo}</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            case 'system_welcome':
                return (
                    <>
                        <div className="shrink-0 w-10 h-10 rounded-md bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900 dark:text-neutral-100">
                                Welcome to Midfield!
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">Let's get you started</p>
                        </div>
                        <UnreadDot />
                    </>
                );
            default:
                return null;
        }
    };

    // Modals and badges keep sidebar open
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

    // Navigation notifications close sidebar
    const href = notification.resource_slug ? `/topic/${notification.resource_slug}` : '#';

    return (
        <Link
            href={href}
            onClick={() => { onRead(); onNavigate(); }}
            className={baseClasses}
        >
            {renderContent()}
        </Link>
    );
}
